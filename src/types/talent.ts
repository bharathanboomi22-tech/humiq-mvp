import { SignalSynthesis, VerdictType, ConfidenceLevel } from './brief';

export interface TalentSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  lastValidated?: string;
}

export interface ConsolidatedProfile {
  summary?: string;
  strengths?: string[];
  areasForGrowth?: string[];
  signals?: SignalSynthesis[];
  overallLevel?: 'junior' | 'mid' | 'senior';
  verdict?: VerdictType;
  confidence?: ConfidenceLevel;
  totalTestsTaken?: number;
  lastTestDate?: string;
  primaryRole?: string;
  experienceRange?: string;
}

export interface WorkLink {
  type: 'github' | 'portfolio' | 'other';
  url: string;
  label?: string;
}

export interface TalentProfile {
  id: string;
  github_url?: string | null;
  name?: string | null;
  email?: string | null;
  consolidated_profile?: ConsolidatedProfile | null;
  skills?: TalentSkill[] | null;
  level?: 'junior' | 'mid' | 'senior' | null;
  last_updated_at: string;
  created_at: string;
  onboarding_completed?: boolean | null;
  discovery_completed?: boolean | null;
  location?: string | null;
  timezone?: string | null;
  languages?: string[] | null;
  availability_status?: string | null;
  work_context?: unknown[] | null;
  work_links?: WorkLink[] | null;
  how_i_work?: string | null;
  profile_visibility?: string | null;
  allow_proof_requests?: boolean | null;
}

export interface TalentWorkSession {
  id: string;
  talent_profile_id: string;
  work_session_id: string;
  created_at: string;
}

export interface TestType {
  id: string;
  name: string;
  description: string;
  roleTrack: 'backend' | 'frontend' | 'fullstack' | 'devops' | 'data' | 'mobile';
  icon: string;
  duration: number;
}

// Discovery session types (uses discovery_conversations table)
export interface DiscoveryMessage {
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}

export interface DiscoverySession {
  id: string;
  talent_profile_id: string;
  messages: DiscoveryMessage[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryProfile {
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  suggestedRole?: string;
  suggestedLevel?: string;
}

export const AVAILABLE_TESTS: TestType[] = [
  {
    id: 'backend',
    name: 'Backend Engineering',
    description: 'APIs, databases, system design, scalability',
    roleTrack: 'backend',
    icon: 'Server',
    duration: 5,
  },
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    description: 'UI/UX, React, performance, accessibility',
    roleTrack: 'frontend',
    icon: 'Layout',
    duration: 5,
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Engineering',
    description: 'End-to-end development, architecture decisions',
    roleTrack: 'fullstack',
    icon: 'Layers',
    duration: 5,
  },
];
