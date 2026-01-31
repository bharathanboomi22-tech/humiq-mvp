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
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
}

export type OnboardingState = 
  | 'welcome'
  | 'cv-upload'
  | 'cv-review'
  | 'exploration'
  | 'simulation-intro'
  | 'simulation'
  | 'evidence'
  | 'confirmation'
  | 'complete';

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
