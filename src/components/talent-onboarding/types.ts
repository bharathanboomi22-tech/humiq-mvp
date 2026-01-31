export interface BasicDetails {
  fullName: string | null;
  location: string | null;
  email: string | null;
  contactNumber: string | null;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  timeline: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  program: string;
  timeline: string;
}

export interface ProfileTrait {
  id: string;
  text: string;
  isNew?: boolean;
}

export interface ProfileSection {
  id: string;
  title: string;
  traits: ProfileTrait[];
  isDraft?: boolean;
}

// Intent & Constraints (Layer 1)
export interface TalentIntent {
  availability: 'immediately' | 'in-1-3-months' | 'in-3-6-months' | 'exploring' | null;
  workTypes: ('full-time' | 'contract' | 'fractional' | 'advisory' | 'open')[];
  workStyle: 'remote' | 'hybrid' | 'on-site' | 'flexible' | null;
  locationConstraints: string | null;
}

// Decision Evidence (Layer 2)
export interface DecisionScenario {
  contextSummary: string | null;
  constraintsSummary: string | null;
  prioritizationResponse: string | null;
  judgmentResponse: string | null;
  reflectionResponse: string | null;
  selfInsightResponse: string | null;
}

export interface DecisionTrace {
  scenario: DecisionScenario;
  interpretation: string | null;
  userConfirmed: boolean;
}

export interface ProfileDraft {
  basicDetails: BasicDetails;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  workStyle: ProfileSection[];
  evidence?: {
    type: 'file' | 'link';
    name: string;
    url?: string;
    description?: string;
    decision?: string;
  }[];
  isAnonymous?: boolean;
  // Layer 1
  intent?: TalentIntent;
  // Layer 2
  decisionTrace?: DecisionTrace;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
}

// New state machine
export type OnboardingState = 
  | 'welcome'
  | 'cv-upload'
  | 'cv-review'
  | 'save-progress'  // CV skip fallback - inline save progress form
  // Layer 1: Intent & Constraints
  | 'intent-availability'
  | 'intent-work-types'
  | 'intent-work-style'
  // Transition
  | 'transition'
  // Layer 2: Decision Evidence
  | 'decision-anchor'
  | 'decision-prioritization'
  | 'decision-judgment'
  | 'decision-reflection'
  | 'decision-self-insight'
  | 'decision-interpretation'
  | 'decision-confirmation'
  | 'evidence'
  | 'complete';

// Legacy states kept for compatibility
export type LegacyOnboardingState = 
  | 'exploration'
  | 'simulation-intro'
  | 'simulation'
  | 'confirmation';

export interface CVEntry {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
}

export interface CVParseResult {
  basic_details: {
    full_name: string | null;
    location: string | null;
    email: string | null;
    contact_number: string | null;
  };
  experience: {
    company: string;
    role: string;
    timeline: string;
  }[];
  education: {
    institution: string;
    program: string;
    timeline: string;
  }[];
}

export interface OnboardingData {
  state: OnboardingState;
  messages: ChatMessage[];
  cvEntries: CVEntry[];
  selectedRoles: string[];
  selectedProblems: string[];
  workEvidence: ProfileDraft['evidence'];
  profileDraft: ProfileDraft;
  isAnonymous: boolean;
  openToConversations: boolean;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  field?: string;
}
