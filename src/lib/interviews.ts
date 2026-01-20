import { supabase } from '@/integrations/supabase/client';
import { InterviewRequest } from '@/components/talent/InterviewInbox';

export const getInterviewRequests = async (talentId: string): Promise<InterviewRequest[]> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select(`
      *,
      company:companies(
        website_url,
        analyzed_data
      ),
      job_posting:job_postings(
        title,
        description
      )
    `)
    .eq('talent_profile_id', talentId)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview requests:', error);
    return [];
  }

  return (data || []) as InterviewRequest[];
};

export const createInterviewRequest = async (input: {
  companyId: string;
  talentId: string;
  jobPostingId?: string;
  message?: string;
}): Promise<InterviewRequest> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .insert({
      company_id: input.companyId,
      talent_profile_id: input.talentId,
      job_posting_id: input.jobPostingId || null,
      message: input.message || null,
      status: 'pending',
    })
    .select(`
      *,
      company:companies(
        website_url,
        analyzed_data
      ),
      job_posting:job_postings(
        title,
        description
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create interview request: ${error.message}`);
  }

  return data as InterviewRequest;
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
