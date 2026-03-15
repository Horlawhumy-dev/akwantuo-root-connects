
-- Fix 1: Prevent hosts from self-approving stays
DROP POLICY IF EXISTS "Hosts can update their own stays" ON public.stays;
CREATE POLICY "Hosts can update their own stays"
ON public.stays FOR UPDATE
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid() AND status = 'pending'::stay_status);

-- Fix 2: Remove guest update policy on payments (only service role should update)
DROP POLICY IF EXISTS "Guests can update own payments" ON public.payments;
