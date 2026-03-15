
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  provider text NOT NULL DEFAULT 'paystack',
  provider_reference text,
  provider_access_code text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(booking_request_id)
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own payments"
ON public.payments FOR SELECT
USING (guest_id = auth.uid());

CREATE POLICY "Hosts can view payments for their bookings"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.booking_requests br
    WHERE br.id = payments.booking_request_id
    AND br.host_id = auth.uid()
  )
);

CREATE POLICY "Guests can create payments"
ON public.payments FOR INSERT
WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Guests can update own payments"
ON public.payments FOR UPDATE
USING (guest_id = auth.uid());

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.stays ADD COLUMN IF NOT EXISTS price_per_night integer DEFAULT 0;
