import { CandidateBrief } from '@/types/brief';
import { supabase } from '@/integrations/supabase/client';

interface AnalyzeCandidateInput {
  githubUrl: string;
  otherLinks?: string;
}

interface AnalyzeCandidateResponse {
  brief: CandidateBrief;
}

interface FetchEvidenceResponse {
  success: boolean;
  username: string;
  repoCount: number;
  rawEvidence: string;
}

export async function analyzeCandidate(input: AnalyzeCandidateInput): Promise<CandidateBrief> {
  // Step 1: Auto-fetch GitHub evidence in background
  let rawWorkEvidence = '';
  
  if (input.githubUrl.trim()) {
    console.log('Auto-fetching GitHub evidence...');
    try {
      const { data: evidenceData, error: evidenceError } = await supabase.functions.invoke<FetchEvidenceResponse>('fetch-github-evidence', {
        body: { githubUrl: input.githubUrl.trim() },
      });

      if (!evidenceError && evidenceData?.rawEvidence) {
        rawWorkEvidence = evidenceData.rawEvidence;
        console.log(`Fetched evidence from ${evidenceData.repoCount} repositories`);
      } else {
        console.warn('Could not fetch GitHub evidence:', evidenceError?.message);
      }
    } catch (fetchError) {
      console.warn('GitHub evidence fetch failed, proceeding with analysis:', fetchError);
    }
  }

  // Step 2: Run analysis with fetched evidence
  const { data, error } = await supabase.functions.invoke<AnalyzeCandidateResponse>('analyze-candidate', {
    body: {
      linkedinUrl: '',
      githubUrl: input.githubUrl,
      websiteUrl: input.otherLinks || undefined,
      rawWorkEvidence,
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
