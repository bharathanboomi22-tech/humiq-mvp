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
  sections: ProfileSection[];
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
