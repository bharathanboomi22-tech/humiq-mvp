-- =====================================================
-- HumIQ Platform Tables: Companies, Jobs, Talents, Matching
-- =====================================================

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_url TEXT NOT NULL,
  description TEXT,
  analyzed_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  analyzed_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Talent profiles table
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_url TEXT NOT NULL,
  name TEXT,
  email TEXT,
  consolidated_profile JSONB DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  level TEXT CHECK (level IN ('junior', 'mid', 'senior')),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link table between talent profiles and work sessions
CREATE TABLE public.talent_work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  work_session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(talent_profile_id, work_session_id)
);

-- Matches table (cache for talent-job matches)
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  score_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(talent_profile_id, job_posting_id)
);

-- Add talent_profile_id to work_sessions (optional link)
ALTER TABLE public.work_sessions 
ADD COLUMN IF NOT EXISTS talent_profile_id UUID REFERENCES public.talent_profiles(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Companies are publicly readable" 
ON public.companies FOR SELECT USING (true);

CREATE POLICY "Anyone can create companies" 
ON public.companies FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update companies" 
ON public.companies FOR UPDATE USING (true);

-- RLS Policies for job_postings
CREATE POLICY "Job postings are publicly readable" 
ON public.job_postings FOR SELECT USING (true);

CREATE POLICY "Anyone can create job postings" 
ON public.job_postings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update job postings" 
ON public.job_postings FOR UPDATE USING (true);

-- RLS Policies for talent_profiles
CREATE POLICY "Talent profiles are publicly readable" 
ON public.talent_profiles FOR SELECT USING (true);

CREATE POLICY "Anyone can create talent profiles" 
ON public.talent_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update talent profiles" 
ON public.talent_profiles FOR UPDATE USING (true);

-- RLS Policies for talent_work_sessions
CREATE POLICY "Talent work sessions are publicly readable" 
ON public.talent_work_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create talent work sessions" 
ON public.talent_work_sessions FOR INSERT WITH CHECK (true);

-- RLS Policies for matches
CREATE POLICY "Matches are publicly readable" 
ON public.matches FOR SELECT USING (true);

CREATE POLICY "Anyone can create matches" 
ON public.matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update matches" 
ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete matches" 
ON public.matches FOR DELETE USING (true);

-- Indexes for performance
CREATE INDEX idx_companies_website ON public.companies(website_url);
CREATE INDEX idx_job_postings_company ON public.job_postings(company_id);
CREATE INDEX idx_job_postings_active ON public.job_postings(is_active) WHERE is_active = true;
CREATE INDEX idx_talent_profiles_github ON public.talent_profiles(github_url);
CREATE INDEX idx_talent_work_sessions_profile ON public.talent_work_sessions(talent_profile_id);
CREATE INDEX idx_talent_work_sessions_session ON public.talent_work_sessions(work_session_id);
CREATE INDEX idx_matches_talent ON public.matches(talent_profile_id);
CREATE INDEX idx_matches_job ON public.matches(job_posting_id);
CREATE INDEX idx_matches_score ON public.matches(match_score DESC);