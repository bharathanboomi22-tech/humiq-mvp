export type VerdictType = 'interview' | 'caution' | 'pass';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type SignalLevel = 'high' | 'medium' | 'low';

export interface WorkArtifact {
  id: string;
  title: string;
  url?: string; // Optional external link
  whatItIs: string;
  whyItMatters: string;
  signals: string[]; // Max 2 signals: Shipping, Ownership, Judgment, Product Sense, Communication
}

export interface SignalSynthesis {
  name: string; // Ownership, Judgment, Execution, Communication
  level: SignalLevel;
  evidence: string;
}

export interface RiskUnknown {
  id: string;
  description: string;
}

export interface ValidationPlan {
  riskToValidate: string;
  question: string;
  strongAnswer?: string;
}

export interface FounderRecommendation {
  verdict: VerdictType;
  reasons: string[]; // Max 2 reasons - plain language
}

export interface CandidateBrief {
  candidateName: string;
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  rationale: string;
  workArtifacts: WorkArtifact[];
  signalSynthesis: SignalSynthesis[];
  risksUnknowns: RiskUnknown[];
  validationPlan: ValidationPlan;
  recommendation: FounderRecommendation;
}

export interface CandidateInput {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
  context?: string;
}
