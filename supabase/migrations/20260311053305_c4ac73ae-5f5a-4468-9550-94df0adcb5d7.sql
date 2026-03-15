
CREATE TABLE public.page_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL UNIQUE,
  page_label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page visibility is publicly readable"
  ON public.page_visibility FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage page visibility"
  ON public.page_visibility FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.page_visibility (page_slug, page_label, enabled) VALUES
  ('destinations', 'Destinations', true),
  ('archive', 'Archive', true),
  ('festivals', 'Festivals', true),
  ('safety', 'Safety', true),
  ('travel-essentials', 'Travel Essentials', true),
  ('events', 'Events', true),
  ('stays', 'Stays', true),
  ('marketplace', 'Marketplace', true),
  ('trip-planner', 'AI Trip Planner', true),
  ('itineraries', 'Itineraries', true);
