-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own leave requests" ON public.leave_requests;

-- Create new policy that allows all authenticated users to view all leave requests
CREATE POLICY "All users can view all leave requests"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (true);