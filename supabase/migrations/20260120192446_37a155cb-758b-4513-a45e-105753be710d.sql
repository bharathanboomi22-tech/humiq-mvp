
-- Drop all existing RLS policies and recreate as fully public

-- companies
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

CREATE POLICY "Public read access" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.companies FOR DELETE USING (true);

-- talent_profiles
DROP POLICY IF EXISTS "Users can create their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can delete their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can update their own talent profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can view talent profiles" ON public.talent_profiles;

CREATE POLICY "Public read access" ON public.talent_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.talent_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.talent_profiles FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.talent_profiles FOR DELETE USING (true);

-- job_postings
DROP POLICY IF EXISTS "Companies can create job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can delete their job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can update their job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Job postings are viewable by everyone" ON public.job_postings;

CREATE POLICY "Public read access" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.job_postings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.job_postings FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.job_postings FOR DELETE USING (true);

-- interview_requests
DROP POLICY IF EXISTS "Companies can create interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Users can update relevant interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Users can view relevant interview requests" ON public.interview_requests;

CREATE POLICY "Public read access" ON public.interview_requests FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.interview_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.interview_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.interview_requests FOR DELETE USING (true);

-- discovery_conversations (add delete)
DROP POLICY IF EXISTS "Anyone can create discovery conversations" ON public.discovery_conversations;
DROP POLICY IF EXISTS "Anyone can update discovery conversations" ON public.discovery_conversations;
DROP POLICY IF EXISTS "Discovery conversations are publicly readable" ON public.discovery_conversations;

CREATE POLICY "Public read access" ON public.discovery_conversations FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.discovery_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.discovery_conversations FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.discovery_conversations FOR DELETE USING (true);

-- work_sessions (add delete)
DROP POLICY IF EXISTS "Anyone can create work sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Anyone can update work sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Work sessions are publicly readable" ON public.work_sessions;

CREATE POLICY "Public read access" ON public.work_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.work_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.work_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.work_sessions FOR DELETE USING (true);

-- work_session_events (add update/delete)
DROP POLICY IF EXISTS "Anyone can create work session events" ON public.work_session_events;
DROP POLICY IF EXISTS "Work session events are publicly readable" ON public.work_session_events;

CREATE POLICY "Public read access" ON public.work_session_events FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.work_session_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.work_session_events FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.work_session_events FOR DELETE USING (true);

-- work_session_stages (add delete)
DROP POLICY IF EXISTS "Anyone can create work session stages" ON public.work_session_stages;
DROP POLICY IF EXISTS "Anyone can update work session stages" ON public.work_session_stages;
DROP POLICY IF EXISTS "Work session stages are publicly readable" ON public.work_session_stages;

CREATE POLICY "Public read access" ON public.work_session_stages FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.work_session_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.work_session_stages FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.work_session_stages FOR DELETE USING (true);

-- talent_work_sessions (add update/delete)
DROP POLICY IF EXISTS "Anyone can create talent work sessions" ON public.talent_work_sessions;
DROP POLICY IF EXISTS "Talent work sessions are publicly readable" ON public.talent_work_sessions;

CREATE POLICY "Public read access" ON public.talent_work_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.talent_work_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.talent_work_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.talent_work_sessions FOR DELETE USING (true);

-- talent_test_results (add delete)
DROP POLICY IF EXISTS "Anyone can create test results" ON public.talent_test_results;
DROP POLICY IF EXISTS "Anyone can update test results" ON public.talent_test_results;
DROP POLICY IF EXISTS "Test results are publicly readable" ON public.talent_test_results;

CREATE POLICY "Public read access" ON public.talent_test_results FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.talent_test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.talent_test_results FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.talent_test_results FOR DELETE USING (true);

-- evidence_packs (add update/delete)
DROP POLICY IF EXISTS "Anyone can create evidence packs" ON public.evidence_packs;
DROP POLICY IF EXISTS "Evidence packs are publicly readable" ON public.evidence_packs;

CREATE POLICY "Public read access" ON public.evidence_packs FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.evidence_packs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.evidence_packs FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.evidence_packs FOR DELETE USING (true);

-- interview_results (add update/delete)
DROP POLICY IF EXISTS "Anyone can create interview results" ON public.interview_results;
DROP POLICY IF EXISTS "Interview results are publicly readable" ON public.interview_results;

CREATE POLICY "Public read access" ON public.interview_results FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.interview_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.interview_results FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.interview_results FOR DELETE USING (true);

-- love_letters (add update/delete)
DROP POLICY IF EXISTS "Anyone can submit a love letter" ON public.love_letters;
DROP POLICY IF EXISTS "Love letters are viewable by everyone" ON public.love_letters;

CREATE POLICY "Public read access" ON public.love_letters FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.love_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.love_letters FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.love_letters FOR DELETE USING (true);

-- matches (already public, just ensure consistency)
DROP POLICY IF EXISTS "Anyone can create matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can delete matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can update matches" ON public.matches;
DROP POLICY IF EXISTS "Matches are publicly readable" ON public.matches;

CREATE POLICY "Public read access" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.matches FOR DELETE USING (true);
