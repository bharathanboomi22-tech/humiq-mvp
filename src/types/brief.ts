export type VerdictType = 'interview' | 'caution' | 'pass';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type SignalLevel = 'high' | 'medium' | 'low';

export interface WorkArtifact {
  id: string;
  title: string;
  url: string;
  whatItIs: string;
  whyItMatters: string;
  signals: string[]; // Max 2 signals
}

export interface SignalSynthesis {
  name: string;
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
  weakAnswer?: string;
}

export interface FounderRecommendation {
  verdict: VerdictType;
  reasons: string[]; // Max 2 reasons
}

export interface ActionLayer {
  outreachMessage: string;
  roleFraming: string;
  first30Days: string;
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
  actionLayer: ActionLayer;
}

export interface CandidateInput {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
}
