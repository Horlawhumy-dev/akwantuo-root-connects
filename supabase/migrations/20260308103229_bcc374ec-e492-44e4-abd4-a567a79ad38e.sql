-- Create stay_type enum
CREATE TYPE public.stay_type AS ENUM ('guesthouse', 'boutique_hotel', 'homestay');

-- Create stay_status enum for approval workflow
CREATE TYPE public.stay_status AS ENUM ('pending', 'approved', 'rejected');

-- Create price_range enum
CREATE TYPE public.price_range AS ENUM ('budget', 'mid_range', 'luxury');

-- Create stays table
CREATE TABLE public.stays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  type stay_type NOT NULL,
  price_range price_range NOT NULL DEFAULT 'mid_range',
  amenities text[] DEFAULT '{}'::text[],
  contact_email text,
  contact_phone text,
  booking_url text,
  host_name text NOT NULL,
  host_bio text,
  image_urls text[] DEFAULT '{}'::text[],
  latitude double precision,
  longitude double precision,
  status stay_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create stay_reviews table
CREATE TABLE public.stay_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id uuid NOT NULL REFERENCES public.stays(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stay_id, user_id)
);

-- Enable RLS
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stay_reviews ENABLE ROW LEVEL SECURITY;

-- Stays policies
CREATE POLICY "Approved stays are publicly readable"
  ON public.stays FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Hosts can view their own stays"
  ON public.stays FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Authenticated users can submit stays"
  ON public.stays FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their own stays"
  ON public.stays FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their own stays"
  ON public.stays FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Admins can manage all stays"
  ON public.stays FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews policies
CREATE POLICY "Reviews are publicly readable"
  ON public.stay_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can write reviews"
  ON public.stay_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON public.stay_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON public.stay_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Updated_at triggers
CREATE TRIGGER update_stays_updated_at
  BEFORE UPDATE ON public.stays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stay_reviews_updated_at
  BEFORE UPDATE ON public.stay_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for stay images
INSERT INTO storage.buckets (id, name, public) VALUES ('stay-images', 'stay-images', true);

-- Storage policies
CREATE POLICY "Anyone can view stay images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stay-images');

CREATE POLICY "Authenticated users can upload stay images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'stay-images');

CREATE POLICY "Users can update their own stay images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'stay-images');

CREATE POLICY "Users can delete their own stay images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'stay-images');

-- Enable realtime for stays
ALTER PUBLICATION supabase_realtime ADD TABLE public.stays;