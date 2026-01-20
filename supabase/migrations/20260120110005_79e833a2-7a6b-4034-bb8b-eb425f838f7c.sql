-- Allow github_url to be nullable in work_sessions
ALTER TABLE public.work_sessions 
ALTER COLUMN github_url DROP NOT NULL;