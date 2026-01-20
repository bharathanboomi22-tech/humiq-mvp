-- Migration: Add authentication support
-- Adds user_id to companies and talent_profiles tables
-- Updates RLS policies to use auth.uid()

-- ============================================
-- 1. Add user_id columns
-- ============================================

-- Add user_id to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to talent_profiles table
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);

-- ============================================
-- 2. Update RLS Policies for companies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Companies are publicly readable" ON public.companies;
DROP POLICY IF EXISTS "Anyone can create companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can update companies" ON public.companies;

-- New policies: Authenticated users can manage their own companies
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode (no user_id)
);

CREATE POLICY "Users can create their own company"
ON public.companies FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode
);

CREATE POLICY "Users can update their own company"
ON public.companies FOR UPDATE
USING (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode
);

CREATE POLICY "Users can delete their own company"
ON public.companies FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 3. Update RLS Policies for talent_profiles
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Talent profiles are publicly readable" ON public.talent_profiles;
DROP POLICY IF EXISTS "Anyone can create talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Anyone can update talent profiles" ON public.talent_profiles;

-- New policies: Authenticated users can manage their own profiles
CREATE POLICY "Users can view talent profiles"
ON public.talent_profiles FOR SELECT
USING (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode
  OR EXISTS (  -- Companies can view matched talent profiles
    SELECT 1 FROM public.talent_job_matches tjm
    JOIN public.job_postings jp ON jp.id = tjm.job_posting_id
    JOIN public.companies c ON c.id = jp.company_id
    WHERE tjm.talent_profile_id = talent_profiles.id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own talent profile"
ON public.talent_profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode
);

CREATE POLICY "Users can update their own talent profile"
ON public.talent_profiles FOR UPDATE
USING (
  user_id = auth.uid() 
  OR user_id IS NULL  -- Allow demo mode
);

CREATE POLICY "Users can delete their own talent profile"
ON public.talent_profiles FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 4. Update related tables RLS
-- ============================================

-- Job postings: Companies can manage their own
DROP POLICY IF EXISTS "Job postings are publicly readable" ON public.job_postings;
DROP POLICY IF EXISTS "Anyone can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Anyone can update job postings" ON public.job_postings;

CREATE POLICY "Job postings are viewable by all authenticated users"
ON public.job_postings FOR SELECT
USING (true);  -- All users can view job postings

CREATE POLICY "Companies can create job postings"
ON public.job_postings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

CREATE POLICY "Companies can update their job postings"
ON public.job_postings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

CREATE POLICY "Companies can delete their job postings"
ON public.job_postings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = job_postings.company_id 
    AND c.user_id = auth.uid()
  )
);

-- ============================================
-- 5. Interview requests RLS updates
-- ============================================

DROP POLICY IF EXISTS "Interview requests are publicly readable" ON public.interview_requests;
DROP POLICY IF EXISTS "Anyone can create interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Anyone can update interview requests" ON public.interview_requests;

CREATE POLICY "Users can view relevant interview requests"
ON public.interview_requests FOR SELECT
USING (
  -- Talent can see their own requests
  EXISTS (
    SELECT 1 FROM public.talent_profiles tp 
    WHERE tp.id = interview_requests.talent_profile_id 
    AND (tp.user_id = auth.uid() OR tp.user_id IS NULL)
  )
  OR
  -- Company can see requests they sent
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

CREATE POLICY "Companies can create interview requests"
ON public.interview_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

CREATE POLICY "Users can update relevant interview requests"
ON public.interview_requests FOR UPDATE
USING (
  -- Talent can respond to their requests
  EXISTS (
    SELECT 1 FROM public.talent_profiles tp 
    WHERE tp.id = interview_requests.talent_profile_id 
    AND (tp.user_id = auth.uid() OR tp.user_id IS NULL)
  )
  OR
  -- Company can update their requests
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = interview_requests.company_id 
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);
