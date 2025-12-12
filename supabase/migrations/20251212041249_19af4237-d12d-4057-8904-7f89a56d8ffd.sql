-- Add backup_note column for leave requests over 4 days
ALTER TABLE public.leave_requests ADD COLUMN backup_note text;