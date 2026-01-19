-- Add github_brief column to store pre-analysis CandidateBrief
ALTER TABLE public.work_sessions 
ADD COLUMN github_brief JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.work_sessions.github_brief IS 'Pre-computed CandidateBrief from GitHub analysis, merged into final evidence pack';
