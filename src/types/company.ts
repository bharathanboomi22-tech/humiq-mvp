export interface CompanyAnalyzedData {
  sector: string;
  size: string;
  culture: string[];
  techStack: string[];
  values: string[];
  summary: string;
}

export interface Company {
  id: string;
  name?: string;
  website_url: string;
  description?: string;
  analyzed_data: CompanyAnalyzedData;
  created_at: string;
}

export interface JobAnalyzedData {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  level: 'junior' | 'mid' | 'senior';
  roleType: 'backend' | 'frontend' | 'fullstack' | 'devops' | 'data' | 'mobile' | 'other';
  techStack: string[];
  responsibilities: string[];
  summary: string;
}

export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  analyzed_data: JobAnalyzedData;
  is_active: boolean;
  created_at: string;
  // Joined fields
  company?: Company;
}

export interface CreateCompanyInput {
  name: string;
  websiteUrl: string;
  description?: string;
}

export interface CreateJobInput {
  companyId: string;
  title: string;
  description: string;
  requirements?: string;
}
