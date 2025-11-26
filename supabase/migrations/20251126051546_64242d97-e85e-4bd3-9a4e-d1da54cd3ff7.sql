-- Add policy to allow users to cancel their own leave requests
CREATE POLICY "Users can cancel their own leave requests"
ON public.leave_requests
FOR UPDATE
USING (
  user_id = auth.uid() 
  AND status IN ('pending'::leave_status, 'approved'::leave_status)
)
WITH CHECK (
  user_id = auth.uid() 
  AND status = 'cancelled'::leave_status
);