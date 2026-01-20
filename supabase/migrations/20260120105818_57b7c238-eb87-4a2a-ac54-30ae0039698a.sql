-- Create interview_results table for storing interview outcomes
CREATE TABLE IF NOT EXISTS public.interview_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_request_id UUID NOT NULL REFERENCES public.interview_requests(id) ON DELETE CASCADE,
  work_session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  
  -- Result
  passed BOOLEAN NOT NULL,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  
  -- Recap côté Talent (axé sur lui)
  talent_recap JSONB NOT NULL DEFAULT '{}',
  
  -- Recap côté Company (axé sur la décision)
  company_recap JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_results_interview_request_id ON public.interview_results(interview_request_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_work_session_id ON public.interview_results(work_session_id);

-- Enable Row Level Security
ALTER TABLE public.interview_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for MVP)
CREATE POLICY "Interview results are publicly readable" 
ON public.interview_results FOR SELECT USING (true);

CREATE POLICY "Anyone can create interview results" 
ON public.interview_results FOR INSERT WITH CHECK (true);