-- =====================================================
-- Talent Onboarding & Discovery Enhancement
-- =====================================================

-- Add new columns to talent_profiles for onboarding data
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT CHECK (availability_status IN ('open', 'exploring', 'not_open')),
ADD COLUMN IF NOT EXISTS work_context JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS how_i_work TEXT,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT CHECK (profile_visibility IN ('public', 'private')) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS allow_proof_requests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discovery_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS work_links JSONB DEFAULT '[]';

-- Make github_url optional (was NOT NULL before)
ALTER TABLE public.talent_profiles 
ALTER COLUMN github_url DROP NOT NULL;

-- Discovery conversations table
CREATE TABLE IF NOT EXISTS public.discovery_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Talent test results table (scores by skill)
CREATE TABLE IF NOT EXISTS public.talent_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  work_session_id UUID REFERENCES public.work_sessions(id) ON DELETE SET NULL,
  test_type TEXT NOT NULL,
  scores_by_skill JSONB NOT NULL DEFAULT '{}',
  analysis JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interview requests table
CREATE TABLE IF NOT EXISTS public.interview_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, talent_profile_id, job_posting_id)
);

-- Enable RLS
ALTER TABLE public.discovery_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discovery_conversations
CREATE POLICY "Discovery conversations are publicly readable" 
ON public.discovery_conversations FOR SELECT USING (true);

CREATE POLICY "Anyone can create discovery conversations" 
ON public.discovery_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update discovery conversations" 
ON public.discovery_conversations FOR UPDATE USING (true);

-- RLS Policies for talent_test_results
CREATE POLICY "Test results are publicly readable" 
ON public.talent_test_results FOR SELECT USING (true);

CREATE POLICY "Anyone can create test results" 
ON public.talent_test_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update test results" 
ON public.talent_test_results FOR UPDATE USING (true);

-- RLS Policies for interview_requests
CREATE POLICY "Interview requests are publicly readable" 
ON public.interview_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can create interview requests" 
ON public.interview_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update interview requests" 
ON public.interview_requests FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovery_conversations_talent ON public.discovery_conversations(talent_profile_id);
CREATE INDEX IF NOT EXISTS idx_talent_test_results_talent ON public.talent_test_results(talent_profile_id);
CREATE INDEX IF NOT EXISTS idx_talent_test_results_session ON public.talent_test_results(work_session_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_talent ON public.interview_requests(talent_profile_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_company ON public.interview_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_job ON public.interview_requests(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_status ON public.interview_requests(status) WHERE status = 'pending';