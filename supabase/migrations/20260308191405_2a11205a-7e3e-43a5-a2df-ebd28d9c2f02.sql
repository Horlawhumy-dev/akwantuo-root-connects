
-- Create shop reviews table
CREATE TABLE public.shop_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shop_id, user_id)
);

ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;

-- Public read for reviews of approved shops
CREATE POLICY "Shop reviews are publicly readable"
ON public.shop_reviews FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shops WHERE shops.id = shop_reviews.shop_id AND shops.status = 'approved'
));

-- Authenticated users can write reviews
CREATE POLICY "Authenticated users can write shop reviews"
ON public.shop_reviews FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update own shop reviews"
ON public.shop_reviews FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own shop reviews"
ON public.shop_reviews FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage all shop reviews"
ON public.shop_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
