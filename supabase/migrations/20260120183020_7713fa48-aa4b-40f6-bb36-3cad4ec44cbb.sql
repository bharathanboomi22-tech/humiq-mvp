-- Migration: Update RLS policies for auth support
-- Fixes the talent_job_matches reference to use correct 'matches' table

-- ============================================
-- 1. Update RLS Policies for companies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Companies are publicly readable" ON public.companies;
DROP POLICY IF EXISTS "Anyone can create companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;

-- New policies: Users can manage their own companies (with demo mode support)
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can create their own company"
ON public.companies FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update their own company"
ON public.companies FOR UPDATE
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can delete their own company"
ON public.companies FOR DELETE
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- ============================================
-- 2. Update RLS Policies for talent_profiles
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Talent profiles are publicly readable" ON public.talent_profiles;
DROP POLICY IF EXISTS "Anyone can create talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Anyone can update talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can view talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can create their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can update their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can delete their own talent profile" ON public.talent_profiles;

-- New policies using correct 'matches' table
CREATE POLICY "Users can view talent profiles"
ON public.talent_profiles FOR SELECT
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
  OR EXISTS (
    SELECT 1 FROM public.matches m
    JOIN public.job_postings jp ON jp.id = m.job_posting_id
    JOIN public.companies c ON c.id = jp.company_id
    WHERE m.talent_profile_id = talent_profiles.id
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

CREATE POLICY "Users can create their own talent profile"
ON public.talent_profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update their own talent profile"
ON public.talent_profiles FOR UPDATE
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can delete their own talent profile"
ON public.talent_profiles FOR DELETE
USING (
  user_id = auth.uid() 
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- ============================================
-- 3. Update Job Postings RLS
-- ============================================

DROP POLICY IF EXISTS "Job postings are publicly readable" ON public.job_postings;
DROP POLICY IF EXISTS "Anyone can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Anyone can update job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Job postings are viewable by all authenticated users" ON public.job_postings;
DROP POLICY IF EXISTS "Job postings are viewable by everyone" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can update their job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can delete their job postings" ON public.job_postings;

CREATE POLICY "Job postings are viewable by everyone"
ON public.job_postings FOR SELECT
USING (true);

CREATE POLICY "Companies can create job postings"
ON public.job_postings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

CREATE POLICY "Companies can update their job postings"
ON public.job_postings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

CREATE POLICY "Companies can delete their job postings"
ON public.job_postings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

-- ============================================
-- 4. Update Interview Requests RLS
-- ============================================

DROP POLICY IF EXISTS "Interview requests are publicly readable" ON public.interview_requests;
DROP POLICY IF EXISTS "Anyone can create interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Anyone can update interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Users can view relevant interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Companies can create interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Users can update relevant interview requests" ON public.interview_requests;

CREATE POLICY "Users can view relevant interview requests"
ON public.interview_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.talent_profiles tp 
    WHERE tp.id = interview_requests.talent_profile_id 
    AND (tp.user_id = auth.uid() OR (auth.uid() IS NULL AND tp.user_id IS NULL))
  )
  OR
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

CREATE POLICY "Companies can create interview requests"
ON public.interview_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);

CREATE POLICY "Users can update relevant interview requests"
ON public.interview_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.talent_profiles tp 
    WHERE tp.id = interview_requests.talent_profile_id 
    AND (tp.user_id = auth.uid() OR (auth.uid() IS NULL AND tp.user_id IS NULL))
  )
  OR
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR (auth.uid() IS NULL AND c.user_id IS NULL))
  )
);