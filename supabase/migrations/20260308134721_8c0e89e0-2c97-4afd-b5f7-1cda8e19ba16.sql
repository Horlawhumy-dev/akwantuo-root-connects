
-- Allow admins to view and manage all payments
CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));
