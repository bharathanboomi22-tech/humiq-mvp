import { CandidateBrief } from '@/types/brief';
import { supabase } from '@/integrations/supabase/client';

interface AnalyzeCandidateInput {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
  founderContext?: string;
}

interface AnalyzeCandidateResponse {
  brief: CandidateBrief;
}

export async function analyzeCandidate(input: AnalyzeCandidateInput): Promise<CandidateBrief> {
  const { data, error } = await supabase.functions.invoke<AnalyzeCandidateResponse>('analyze-candidate', {
    body: input
  });

  if (error) {
    console.error('Error analyzing candidate:', error);
    throw new Error(error.message || 'Failed to analyze candidate');
  }

  if (!data?.brief) {
    throw new Error('No brief returned from analysis');
  }

  return data.brief;
}
