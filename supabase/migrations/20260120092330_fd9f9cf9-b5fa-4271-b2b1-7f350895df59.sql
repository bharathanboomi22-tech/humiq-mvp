-- Add job_context column to work_sessions table
ALTER TABLE public.work_sessions
ADD COLUMN job_context jsonb DEFAULT NULL;