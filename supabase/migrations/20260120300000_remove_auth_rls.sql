-- Remove auth requirements from RLS policies
-- Allow demo mode (null user_id) for all operations

-- ============================================
-- 1. Update talent_profiles RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can create their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can update their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can delete their own talent profile" ON public.talent_profiles;

-- Allow all operations (demo mode)
CREATE POLICY "Anyone can view talent profiles"
ON public.talent_profiles FOR SELECT
USING (true);

CREATE POLICY "Anyone can create talent profiles"
ON public.talent_profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update talent profiles"
ON public.talent_profiles FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete talent profiles"
ON public.talent_profiles FOR DELETE
USING (true);

-- ============================================
-- 2. Update companies RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;

CREATE POLICY "Anyone can view companies"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Anyone can create companies"
ON public.companies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update companies"
ON public.companies FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete companies"
ON public.companies FOR DELETE
USING (true);

-- ============================================
-- 3. Update job_postings RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Company users can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Company users can update their job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Company users can delete their job postings" ON public.job_postings;

CREATE POLICY "Anyone can view job postings"
ON public.job_postings FOR SELECT
USING (true);

CREATE POLICY "Anyone can create job postings"
ON public.job_postings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update job postings"
ON public.job_postings FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete job postings"
ON public.job_postings FOR DELETE
USING (true);

-- ============================================
-- 4. Update interview_requests RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view their interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Companies can create interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Users can update interview requests" ON public.interview_requests;

CREATE POLICY "Anyone can view interview requests"
ON public.interview_requests FOR SELECT
USING (true);

CREATE POLICY "Anyone can create interview requests"
ON public.interview_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update interview requests"
ON public.interview_requests FOR UPDATE
USING (true);

-- ============================================
-- 5. Update talent_job_matches RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view matches" ON public.talent_job_matches;
DROP POLICY IF EXISTS "System can create matches" ON public.talent_job_matches;
DROP POLICY IF EXISTS "Users can update matches" ON public.talent_job_matches;

CREATE POLICY "Anyone can view matches"
ON public.talent_job_matches FOR SELECT
USING (true);

CREATE POLICY "Anyone can create matches"
ON public.talent_job_matches FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
ON public.talent_job_matches FOR UPDATE
USING (true);
