// Re-export from talent.ts for convenience
export type { DiscoverySession, DiscoveryProfile } from './talent';

// Onboarding data structure
export interface TalentOnboardingData {
  // Step 1: Basic Info
  name: string;
  email: string;
  location: string;
  languages: string[];
  
  // Step 2: Experience
  yearsExperience: number | null;
  level: 'junior' | 'mid' | 'senior' | 'lead' | null;
  preferredRole: string;
  
  // Step 3: Work Context
  workPreference: 'remote' | 'hybrid' | 'onsite' | null;
  availability: 'immediate' | '1_month' | '3_months' | 'not_looking' | null;
  contractType: 'cdi' | 'cdd' | 'freelance' | 'internship' | null;
  
  // Step 4: Links (optional)
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  otherLinks: string;
}

export const INITIAL_ONBOARDING_DATA: TalentOnboardingData = {
  name: '',
  email: '',
  location: '',
  languages: [],
  yearsExperience: null,
  level: null,
  preferredRole: '',
  workPreference: null,
  availability: null,
  contractType: null,
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  otherLinks: '',
};

export const AVAILABLE_LANGUAGES = [
  'English',
  'French',
  'Spanish',
  'German',
  'Portuguese',
  'Italian',
  'Dutch',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
];

export const AVAILABLE_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Engineer',
  'ML Engineer',
  'QA Engineer',
  'Tech Lead',
  'Engineering Manager',
];
