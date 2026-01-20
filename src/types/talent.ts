import { SignalSynthesis, VerdictType, ConfidenceLevel } from './brief';

export interface TalentSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  lastValidated?: string;
}

export interface ConsolidatedProfile {
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  signals: SignalSynthesis[];
  overallLevel: 'junior' | 'mid' | 'senior';
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  totalTestsTaken: number;
  lastTestDate?: string;
}

export interface TalentProfile {
  id: string;
  github_url: string;
  name?: string;
  email?: string;
  consolidated_profile: ConsolidatedProfile;
  skills: TalentSkill[];
  level?: 'junior' | 'mid' | 'senior';
  last_updated_at: string;
  created_at: string;
  onboarding_completed?: boolean;
  discovery_completed?: boolean;
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
