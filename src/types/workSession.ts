// Work Session Types

export type RoleTrack = 'backend' | 'frontend';
export type SessionLevel = 'junior' | 'mid' | 'senior';
export type SessionDuration = 5 | 15 | 30 | 45;
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type StageName = 'framing' | 'approach' | 'build' | 'review';
export type EventType = 'PROMPT' | 'RESPONSE' | 'CODE_SNAPSHOT' | 'SYSTEM';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface WorkSession {
  id: string;
  github_url: string;
  role_track: RoleTrack;
  level: SessionLevel;
  duration: SessionDuration;
  status: SessionStatus;
  raw_work_evidence: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface WorkSessionStage {
  id: string;
  session_id: string;
  stage_name: StageName;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface WorkSessionEvent {
  id: string;
  session_id: string;
  event_type: EventType;
  content: EventContent;
  created_at: string;
}

// Content types for different event types
export interface PromptContent {
  text: string;
  stage: StageName;
  signal_tags?: string[];
}

export interface ResponseContent {
  text: string;
  stage: StageName;
}

export interface CodeSnapshotContent {
  code: string;
  language?: string;
  stage: StageName;
}

export interface SystemContent {
  message: string;
  type: 'stage_change' | 'timer_warning' | 'session_start' | 'session_end';
}

export type EventContent = PromptContent | ResponseContent | CodeSnapshotContent | SystemContent;

// Evidence Pack types
export interface EvidencePackStrength {
  signal: string;
  evidence: string;
}

export interface EvidencePackRisk {
  signal: string;
  evidence_gap: string;
}

export interface EvidencePackDecision {
  decision: string;
  tradeoff: string;
  example: string;
}

export interface EvidencePackObservation {
  observation: string;
  example: string;
}

export interface EvidencePackSummary {
  roleTrack: RoleTrack;
  levelEstimate: SessionLevel;
  confidence: ConfidenceLevel;
  strengths: EvidencePackStrength[];
  risks_or_unknowns: EvidencePackRisk[];
  decision_log: EvidencePackDecision[];
  execution_observations: EvidencePackObservation[];
  recommended_next_step: string;
  highlights: string[];
  github_summary?: string;
}

export interface EvidencePack {
  id: string;
  session_id: string;
  public_share_id: string;
  summary_json: EvidencePackSummary;
  generated_at: string;
  created_at: string;
}

// API Input/Output types
export interface CreateWorkSessionInput {
  githubUrl: string;
  roleTrack: RoleTrack;
  level: SessionLevel;
  duration: SessionDuration;
}

export interface CreateWorkSessionResponse {
  sessionId: string;
  githubUrl: string;
  hasGitHubData: boolean;
}

export interface AddSessionEventInput {
  sessionId: string;
  eventType: EventType;
  content: EventContent;
}

export interface GetNextPromptInput {
  sessionId: string;
  candidateResponse?: string;
  currentStage: StageName;
}

export interface GetNextPromptResponse {
  nextPrompt: string;
  stageComplete: boolean;
  signalTags: string[];
}

export interface CompleteSessionResponse {
  evidencePackId: string;
  shareId: string;
}

// Stage configuration
export const STAGE_CONFIG: Record<StageName, { label: string; minMinutes: number; maxMinutes: number }> = {
  framing: { label: 'Problem Framing', minMinutes: 1, maxMinutes: 2 },
  approach: { label: 'Solution Approach', minMinutes: 1, maxMinutes: 2 },
  build: { label: 'Build / Pseudocode', minMinutes: 1, maxMinutes: 2 },
  review: { label: 'Review & Hardening', minMinutes: 1, maxMinutes: 2 },
};

export const STAGE_ORDER: StageName[] = ['framing', 'approach', 'build', 'review'];
