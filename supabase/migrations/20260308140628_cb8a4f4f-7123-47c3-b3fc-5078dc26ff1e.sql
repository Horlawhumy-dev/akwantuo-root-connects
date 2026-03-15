
-- Hospitals & clinics table
CREATE TABLE public.hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Ghana',
  type TEXT NOT NULL DEFAULT 'hospital',
  address TEXT,
  phone TEXT,
  emergency BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospitals are publicly readable" ON public.hospitals
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage hospitals" ON public.hospitals
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Transport hubs table
CREATE TABLE public.transport_hubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Ghana',
  type TEXT NOT NULL DEFAULT 'bus_station',
  address TEXT,
  phone TEXT,
  description TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_hubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transport hubs are publicly readable" ON public.transport_hubs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage transport hubs" ON public.transport_hubs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Events table
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Ghana',
  category TEXT NOT NULL DEFAULT 'cultural',
  description TEXT NOT NULL DEFAULT '',
  venue TEXT,
  image TEXT NOT NULL DEFAULT '',
  date_start DATE NOT NULL,
  date_end DATE,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
