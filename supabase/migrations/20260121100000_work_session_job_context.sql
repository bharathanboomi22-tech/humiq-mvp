-- Add job_context column for job-based interviews
ALTER TABLE public.work_sessions 
ADD COLUMN IF NOT EXISTS job_context JSONB;

-- Make github_url optional (nullable) for interviews without GitHub
ALTER TABLE public.work_sessions 
ALTER COLUMN github_url DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.work_sessions.job_context IS 'Job posting context for job-based interviews (title, description, requirements, tech stack)';
