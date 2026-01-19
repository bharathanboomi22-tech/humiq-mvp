-- Enrichir talent_profiles avec nouveaux champs onboarding
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('junior', 'mid', 'senior', 'lead')),
ADD COLUMN IF NOT EXISTS preferred_role TEXT CHECK (preferred_role IN ('frontend', 'backend', 'fullstack', 'devops', 'mobile', 'data', 'ml', 'other')),
ADD COLUMN IF NOT EXISTS work_preference TEXT CHECK (work_preference IN ('remote', 'hybrid', 'onsite')),
ADD COLUMN IF NOT EXISTS availability TEXT CHECK (availability IN ('immediate', '1_month', '3_months', 'not_looking')),
ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('cdi', 'cdd', 'freelance', 'any')),
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS other_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discovery_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discovery_profile JSONB;

-- Table pour les sessions de decouverte
CREATE TABLE IF NOT EXISTS public.discovery_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  transcript JSONB DEFAULT '[]',
  discovery_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour discovery_sessions
CREATE INDEX IF NOT EXISTS idx_discovery_sessions_talent ON public.discovery_sessions(talent_profile_id);

-- RLS pour discovery_sessions
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discovery sessions are readable by anyone" 
ON public.discovery_sessions FOR SELECT USING (true);

CREATE POLICY "Discovery sessions can be created by anyone" 
ON public.discovery_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Discovery sessions can be updated by anyone" 
ON public.discovery_sessions FOR UPDATE USING (true);

-- Table pour les demandes d'interview
CREATE TABLE IF NOT EXISTS public.interview_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Index pour interview_requests
CREATE INDEX IF NOT EXISTS idx_interview_requests_talent ON public.interview_requests(talent_profile_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_company ON public.interview_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_job ON public.interview_requests(job_posting_id);

-- RLS pour interview_requests
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interview requests are readable by anyone" 
ON public.interview_requests FOR SELECT USING (true);

CREATE POLICY "Interview requests can be created by anyone" 
ON public.interview_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Interview requests can be updated by anyone" 
ON public.interview_requests FOR UPDATE USING (true);
