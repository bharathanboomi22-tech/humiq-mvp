import { CandidateBrief } from '@/types/brief';
import { supabase } from '@/integrations/supabase/client';

interface AnalyzeCandidateInput {
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl?: string;
  context?: string; // Optional context from founder
  rawWorkEvidence?: string; // Internal field - operator-provided evidence
}

interface AnalyzeCandidateResponse {
  brief: CandidateBrief;
}

export async function analyzeCandidate(input: AnalyzeCandidateInput): Promise<CandidateBrief> {
  const { data, error } = await supabase.functions.invoke<AnalyzeCandidateResponse>('analyze-candidate', {
    body: {
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      websiteUrl: input.websiteUrl,
      context: input.context,
      rawWorkEvidence: input.rawWorkEvidence || '', // Empty triggers insufficient evidence path
    }
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
