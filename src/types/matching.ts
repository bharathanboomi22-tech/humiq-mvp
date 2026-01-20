import { Company, JobPosting } from './company';
import { TalentProfile } from './talent';

export interface ScoreBreakdown {
  skillsMatch: number; // 0-100
  levelMatch: number; // 0-100
  stackMatch: number; // 0-100
  overallFit: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  notes?: string;
}

export interface Match {
  id: string;
  talent_profile_id: string;
  job_posting_id: string;
  match_score: number; // 0-100
  score_breakdown: ScoreBreakdown;
  created_at: string;
  // Joined fields
  talent_profile?: TalentProfile;
  job_posting?: JobPosting;
  company?: Company;
}

export interface MatchResult {
  matches: Match[];
  totalCount: number;
}

export type MatchScoreLabel = 'Excellent' | 'Good' | 'Fair' | 'Low';

export const getMatchScoreLabel = (score: number): MatchScoreLabel => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
};

export const getMatchScoreColor = (score: number): string => {
  if (score >= 80) return 'text-verdict-interview';
  if (score >= 60) return 'text-accent';
  if (score >= 40) return 'text-verdict-caution';
  return 'text-verdict-pass';
};
