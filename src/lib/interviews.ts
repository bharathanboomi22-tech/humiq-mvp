import { supabase } from '@/integrations/supabase/client';
import { InterviewRequest } from '@/components/talent/InterviewInbox';

export const getInterviewRequests = async (talentId: string): Promise<InterviewRequest[]> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select(`
      *,
      company:companies(
        name,
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
        name,
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

export const getInterviewRequestForMatch = async (
  talentId: string,
  jobPostingId: string
): Promise<InterviewRequest | null> => {
  const { data, error } = await supabase
    .from('interview_requests')
    .select(`
      *,
      company:companies(
        name,
        website_url,
        analyzed_data
      ),
      job_posting:job_postings(
        title,
        description
      )
    `)
    .eq('talent_profile_id', talentId)
    .eq('job_posting_id', jobPostingId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching interview request for match:', error);
    return null;
  }

  return (data as InterviewRequest) || null;
};

export interface InterviewResult {
  id: string;
  interview_request_id: string;
  work_session_id: string;
  passed: boolean;
  confidence: 'high' | 'medium' | 'low';
  talent_recap: {
    summary: string;
    strengths: string[];
    areasToImprove: string[];
    advice: string;
    nextSteps: string;
  };
  company_recap: {
    summary: string;
    fitScore: number;
    skillsAssessed: string[];
    redFlags: string[];
    recommendation: string;
  };
  created_at: string;
  interview_request?: InterviewRequest;
}

export const getInterviewResult = async (resultId: string): Promise<InterviewResult | null> => {
  const { data, error } = await supabase
    .from('interview_results')
    .select(`
      *,
      interview_request:interview_requests(
        *,
        company:companies(
          website_url,
          analyzed_data
        ),
        job_posting:job_postings(
          title,
          description
        )
      )
    `)
    .eq('id', resultId)
    .single();

  if (error) {
    console.error('Error fetching interview result:', error);
    return null;
  }

  return data as unknown as InterviewResult;
};

export const getInterviewResultsForTalent = async (talentId: string): Promise<InterviewResult[]> => {
  const { data, error } = await supabase
    .from('interview_results')
    .select(`
      *,
      interview_request:interview_requests!inner(
        *,
        company:companies(
          website_url,
          analyzed_data
        ),
        job_posting:job_postings(
          title,
          description
        )
      )
    `)
    .eq('interview_request.talent_profile_id', talentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview results for talent:', error);
    return [];
  }

  return (data || []) as unknown as InterviewResult[];
};

export const getInterviewResultForRequest = async (interviewRequestId: string): Promise<InterviewResult | null> => {
  const { data, error } = await supabase
    .from('interview_results')
    .select(`
      *,
      interview_request:interview_requests(
        *,
        company:companies(
          website_url,
          analyzed_data
        ),
        job_posting:job_postings(
          title,
          description
        )
      )
    `)
    .eq('interview_request_id', interviewRequestId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching interview result for request:', error);
    return null;
  }

  return (data as unknown as InterviewResult) || null;
};

export interface InterviewResultWithTalent extends InterviewResult {
  interview_request: InterviewRequest & {
    talent_profile?: {
      id: string;
      name?: string;
      email?: string;
      github_url?: string;
      consolidated_profile?: unknown;
    };
    job_posting?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export const getInterviewResultsForCompany = async (companyId: string): Promise<InterviewResultWithTalent[]> => {
  const { data, error } = await supabase
    .from('interview_results')
    .select(`
      *,
      interview_request:interview_requests!inner(
        *,
        talent_profile:talent_profiles(
          id,
          name,
          email,
          github_url,
          consolidated_profile
        ),
        job_posting:job_postings(
          id,
          title,
          description
        )
      )
    `)
    .eq('interview_request.company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview results for company:', error);
    return [];
  }

  return (data || []) as unknown as InterviewResultWithTalent[];
};
