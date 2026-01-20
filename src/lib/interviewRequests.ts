import { supabase } from '@/integrations/supabase/client';
import { InterviewRequest, CreateInterviewRequestInput, InterviewRequestStatus } from '@/types/interviewRequest';

export const createInterviewRequest = async (
  input: CreateInterviewRequestInput
): Promise<InterviewRequest> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .insert({
      company_id: input.companyId,
      talent_profile_id: input.talentProfileId,
      job_posting_id: input.jobPostingId,
      message: input.message,
      status: 'pending',
    })
    .select(`
      *,
      company:companies(*),
      talent_profile:talent_profiles(*),
      job_posting:job_postings(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create interview request: ${error.message}`);
  }

  return data as InterviewRequest;
};

export const getInterviewRequestsForTalent = async (
  talentProfileId: string
): Promise<InterviewRequest[]> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select(`
      *,
      company:companies(*),
      job_posting:job_postings(*)
    `)
    .eq('talent_profile_id', talentProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview requests:', error);
    return [];
  }

  return data as InterviewRequest[];
};

export const getInterviewRequestsForCompany = async (
  companyId: string
): Promise<InterviewRequest[]> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select(`
      *,
      talent_profile:talent_profiles(*),
      job_posting:job_postings(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview requests:', error);
    return [];
  }

  return data as InterviewRequest[];
};

export const respondToInterviewRequest = async (
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<void> => {
  const { error } = await supabase
    .from('interview_requests')
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    throw new Error(`Failed to respond to interview request: ${error.message}`);
  }
};

export const hasExistingRequest = async (
  companyId: string,
  talentProfileId: string,
  jobPostingId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select('id')
    .eq('company_id', companyId)
    .eq('talent_profile_id', talentProfileId)
    .eq('job_posting_id', jobPostingId)
    .limit(1);

  if (error) {
    console.error('Error checking existing request:', error);
    return false;
  }

  return data && data.length > 0;
};
