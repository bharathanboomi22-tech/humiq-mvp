-- Allow 5-minute demo sessions
ALTER TABLE public.work_sessions
DROP CONSTRAINT IF EXISTS work_sessions_duration_check;

ALTER TABLE public.work_sessions
ADD CONSTRAINT work_sessions_duration_check
CHECK (duration = ANY (ARRAY[5, 15, 30, 45]));
