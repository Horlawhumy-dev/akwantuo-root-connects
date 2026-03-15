
-- Add 'cancelled' to booking_status enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Create cancellations table for tracking refund details
CREATE TABLE public.cancellations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_request_id UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL,
  reason TEXT,
  refund_percentage INTEGER NOT NULL DEFAULT 0,
  refund_amount INTEGER NOT NULL DEFAULT 0,
  original_amount INTEGER NOT NULL DEFAULT 0,
  cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_request_id)
);

-- Enable RLS
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- Guests can view their own cancellations
CREATE POLICY "Guests can view own cancellations"
ON public.cancellations FOR SELECT
TO authenticated
USING (guest_id = auth.uid());

-- Hosts can view cancellations for their bookings
CREATE POLICY "Hosts can view cancellations for their bookings"
ON public.cancellations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.booking_requests br
    WHERE br.id = cancellations.booking_request_id
    AND br.host_id = auth.uid()
  )
);

-- Admins can manage all cancellations
CREATE POLICY "Admins can manage all cancellations"
ON public.cancellations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
