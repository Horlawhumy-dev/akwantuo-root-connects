
-- Update delete policy to allow guests to cancel accepted bookings that haven't been paid
DROP POLICY IF EXISTS "Guests can delete pending requests" ON public.booking_requests;
CREATE POLICY "Guests can delete unpaid requests"
ON public.booking_requests FOR DELETE
USING (
  guest_id = auth.uid() 
  AND (
    status = 'pending'::booking_status 
    OR (
      status = 'accepted'::booking_status 
      AND NOT EXISTS (
        SELECT 1 FROM public.payments p 
        WHERE p.booking_request_id = booking_requests.id 
        AND p.status = 'success'
      )
    )
  )
);
