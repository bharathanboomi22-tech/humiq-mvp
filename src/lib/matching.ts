import { supabase } from '@/integrations/supabase/client';
import { Match, MatchResult } from '@/types/matching';

export const getMatchesForTalent = async (talentProfileId: string): Promise<Match[]> => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      job_posting:job_postings(*, company:companies(*))
    `)
    .eq('talent_profile_id', talentProfileId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches for talent:', error);
    return [];
  }

  return data as Match[];
};

export const getMatchesForJob = async (jobPostingId: string): Promise<Match[]> => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      talent_profile:talent_profiles(*)
    `)
    .eq('job_posting_id', jobPostingId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches for job:', error);
    return [];
  }

  return data as Match[];
};

export const getMatchesForCompany = async (companyId: string): Promise<Match[]> => {
  // First get all job postings for this company
  const { data: jobs } = await supabase
    .from('job_postings')
    .select('id')
    .eq('company_id', companyId)
    .eq('is_active', true);

  if (!jobs || jobs.length === 0) {
    return [];
  }

  const jobIds = jobs.map((j) => j.id);

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      talent_profile:talent_profiles(*),
      job_posting:job_postings(*)
    `)
    .in('job_posting_id', jobIds)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches for company:', error);
    return [];
  }

  return data as Match[];
};

export const runMatchingForTalent = async (talentProfileId: string): Promise<MatchResult> => {
  const { data, error } = await supabase.functions.invoke('match-talent-to-jobs', {
    body: { talentProfileId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to run matching');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};

export const runMatchingForJob = async (jobPostingId: string): Promise<MatchResult> => {
  const { data, error } = await supabase.functions.invoke('match-talent-to-jobs', {
    body: { jobPostingId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to run matching');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};
