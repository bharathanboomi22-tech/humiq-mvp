export type DecisionType = 'hire' | 'needs-signal' | 'pass';

export interface WorkEvidence {
  id: string;
  title: string;
  explanation: string;
  url: string;
  type: 'repo' | 'product' | 'blog' | 'demo';
}

export interface StrengthItem {
  id: string;
  text: string;
}

export interface RiskItem {
  id: string;
  question: string;
}

export interface InterviewBlock {
  timeRange: string;
  objective: string;
  prompts: string[];
}

export interface CandidateBrief {
  candidateName: string;
  role: 'Founding Engineer';
  decision: DecisionType;
  workEvidence: WorkEvidence[];
  strengths: StrengthItem[];
  risks: RiskItem[];
  interviewPlan: InterviewBlock[];
  outreachMessage: string;
}

export interface CandidateInput {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
}
