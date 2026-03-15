
-- Delivery style enum
CREATE TYPE public.delivery_style AS ENUM ('pickup', 'delivery', 'both');

-- Shop status reuses stay_status pattern
CREATE TYPE public.shop_status AS ENUM ('pending', 'approved', 'rejected');

-- Shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  country TEXT NOT NULL DEFAULT 'Ghana',
  region TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  image_urls TEXT[] DEFAULT '{}'::TEXT[],
  delivery_style delivery_style NOT NULL DEFAULT 'both',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status shop_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products / services table
CREATE TABLE public.shop_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GHS',
  image_url TEXT,
  is_service BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

-- Shops RLS policies
CREATE POLICY "Approved shops are publicly readable" ON public.shops
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can view their own shops" ON public.shops
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can submit shops" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own shops" ON public.shops
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own shops" ON public.shops
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all shops" ON public.shops
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Products RLS policies
CREATE POLICY "Products of approved shops are publicly readable" ON public.shop_products
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_products.shop_id AND shops.status = 'approved'
  ));

CREATE POLICY "Owners can manage their shop products" ON public.shop_products
  FOR ALL TO authenticated USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_products.shop_id AND shops.owner_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all products" ON public.shop_products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
