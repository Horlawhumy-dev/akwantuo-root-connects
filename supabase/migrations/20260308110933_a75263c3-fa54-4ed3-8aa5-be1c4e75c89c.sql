-- Create booking request status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'declined');

-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id UUID NOT NULL REFERENCES public.stays(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL,
  host_id UUID NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  host_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Guests can view their own requests
CREATE POLICY "Guests can view own requests" ON booking_requests
FOR SELECT USING (guest_id = auth.uid());

-- Hosts can view requests for their stays
CREATE POLICY "Hosts can view requests for their stays" ON booking_requests
FOR SELECT USING (host_id = auth.uid());

-- Authenticated users can create booking requests
CREATE POLICY "Authenticated users can create requests" ON booking_requests
FOR INSERT WITH CHECK (guest_id = auth.uid());

-- Hosts can update (respond to) requests for their stays
CREATE POLICY "Hosts can update requests" ON booking_requests
FOR UPDATE USING (host_id = auth.uid());

-- Guests can delete their pending requests
CREATE POLICY "Guests can delete pending requests" ON booking_requests
FOR DELETE USING (guest_id = auth.uid() AND status = 'pending');

-- Add updated_at trigger
CREATE TRIGGER set_booking_requests_updated_at
BEFORE UPDATE ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for booking requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;