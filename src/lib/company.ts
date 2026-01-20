import { supabase } from '@/integrations/supabase/client';
import { Company, JobPosting, CreateCompanyInput, CreateJobInput } from '@/types/company';

const COMPANY_ID_KEY = 'humiq_company_id';

export const getStoredCompanyId = (): string | null => {
  return localStorage.getItem(COMPANY_ID_KEY);
};

export const setStoredCompanyId = (companyId: string): void => {
  localStorage.setItem(COMPANY_ID_KEY, companyId);
};

export const clearStoredCompanyId = (): void => {
  localStorage.removeItem(COMPANY_ID_KEY);
};

export const analyzeCompany = async (input: CreateCompanyInput): Promise<Company> => {
  const { data, error } = await supabase.functions.invoke('analyze-company', {
    body: {
      name: input.name,
      websiteUrl: input.websiteUrl,
      description: input.description,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to analyze company');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.company;
};

export const getCompany = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data as unknown as Company;
};

export interface UpdateCompanyInput {
  description?: string;
}

export const updateCompany = async (
  companyId: string,
  input: UpdateCompanyInput
): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .update({
      description: input.description,
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`);
  }

  return data as unknown as Company;
};

export const analyzeJob = async (input: CreateJobInput): Promise<JobPosting> => {
  const { data, error } = await supabase.functions.invoke('analyze-job', {
    body: {
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to analyze job');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.jobPosting;
};

export const getCompanyJobs = async (companyId: string, includeInactive = false): Promise<JobPosting[]> => {
  let query = supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data as unknown as JobPosting[];
};

export const getJobPosting = async (jobId: string): Promise<JobPosting | null> => {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*, company:companies(*)')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  return data as unknown as JobPosting;
};

export interface UpdateJobInput {
  title?: string;
  description?: string;
  requirements?: string;
}

export const updateJob = async (jobId: string, input: UpdateJobInput): Promise<JobPosting> => {
  const { data, error } = await supabase
    .from('job_postings')
    .update({
      title: input.title,
      description: input.description,
      requirements: input.requirements,
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return data as unknown as JobPosting;
};

export const toggleJobActive = async (jobId: string, isActive: boolean): Promise<JobPosting> => {
  const { data, error } = await supabase
    .from('job_postings')
    .update({ is_active: isActive })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle job status: ${error.message}`);
  }

  return data as unknown as JobPosting;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to delete job: ${error.message}`);
  }
};
