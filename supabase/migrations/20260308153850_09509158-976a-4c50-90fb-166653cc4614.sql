
-- Wishlist table for saving stays and destinations
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('stay', 'destination', 'event')),
  item_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists" ON public.wishlists
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can add to wishlist" ON public.wishlists
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from wishlist" ON public.wishlists
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Itineraries table
CREATE TABLE public.itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  start_date date,
  end_date date,
  country text NOT NULL DEFAULT 'Ghana',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itineraries" ON public.itineraries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create itineraries" ON public.itineraries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own itineraries" ON public.itineraries
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own itineraries" ON public.itineraries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Itinerary items
CREATE TABLE public.itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number integer NOT NULL DEFAULT 1,
  item_type text NOT NULL CHECK (item_type IN ('stay', 'event', 'destination', 'custom')),
  item_id text,
  title text NOT NULL,
  notes text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own itinerary items" ON public.itinerary_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can add itinerary items" ON public.itinerary_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own itinerary items" ON public.itinerary_items
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own itinerary items" ON public.itinerary_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.itineraries WHERE id = itinerary_items.itinerary_id AND user_id = auth.uid())
  );

-- Add updated_at trigger to itineraries
CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
