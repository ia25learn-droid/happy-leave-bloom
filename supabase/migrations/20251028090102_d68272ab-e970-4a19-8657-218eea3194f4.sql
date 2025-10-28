-- Allow users to view profiles of users with approved leave requests
-- This enables the calendar to show initials/names of colleagues on leave
CREATE POLICY "Users can view profiles of users with approved leave"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leave_requests
    WHERE leave_requests.user_id = profiles.id
    AND leave_requests.status = 'approved'
  )
);