import { Company, JobPosting } from './company';
import { TalentProfile } from './talent';

export type InterviewRequestStatus = 'pending' | 'accepted' | 'declined';

export interface InterviewRequest {
  id: string;
  company_id: string;
  talent_profile_id: string;
  job_posting_id: string;
  status: InterviewRequestStatus;
  message?: string;
  created_at: string;
  responded_at?: string;
  // Joined data
  company?: Company;
  talent_profile?: TalentProfile;
  job_posting?: JobPosting;
}

export interface CreateInterviewRequestInput {
  companyId: string;
  talentProfileId: string;
  jobPostingId: string;
  message?: string;
}
