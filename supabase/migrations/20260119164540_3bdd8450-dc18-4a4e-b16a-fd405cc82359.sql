-- Add github_brief column to store the pre-generated candidate brief from GitHub analysis
ALTER TABLE public.work_sessions 
ADD COLUMN github_brief jsonb DEFAULT NULL;