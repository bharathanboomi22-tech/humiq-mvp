import { supabase } from '@/integrations/supabase/client';
import { TalentProfile, ConsolidatedProfile } from '@/types/talent';
import { WorkSession, EvidencePackSummary } from '@/types/workSession';
import { Json } from '@/integrations/supabase/types';

const TALENT_ID_KEY = 'humiq_talent_id';

export const getStoredTalentId = (): string | null => {
  return localStorage.getItem(TALENT_ID_KEY);
};

export const setStoredTalentId = (talentId: string): void => {
  localStorage.setItem(TALENT_ID_KEY, talentId);
};

export const clearStoredTalentId = (): void => {
  localStorage.removeItem(TALENT_ID_KEY);
};

export const getTalentProfile = async (talentId: string): Promise<TalentProfile | null> => {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('id', talentId)
    .single();

  if (error) {
    console.error('Error fetching talent profile:', error);
    return null;
  }

  return data as unknown as TalentProfile;
};

// Demo mode: get all talents
export const getAllTalents = async (): Promise<TalentProfile[]> => {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all talents:', error);
    return [];
  }

  return (data || []) as unknown as TalentProfile[];
};

export const createTalentProfile = async (githubUrl: string, name?: string): Promise<TalentProfile> => {
  const { data, error } = await supabase
    .from('talent_profiles')
    .insert({
      github_url: githubUrl,
      name: name || null,
      consolidated_profile: {},
      skills: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create talent profile: ${error.message}`);
  }

  return data as unknown as TalentProfile;
};

export const getOrCreateTalentProfile = async (githubUrl: string): Promise<TalentProfile> => {
  // Check if profile already exists for this GitHub URL
  const { data: existing } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('github_url', githubUrl)
    .single();

  if (existing) {
    return existing as unknown as TalentProfile;
  }

  // Create new profile
  return createTalentProfile(githubUrl);
};

export const linkSessionToProfile = async (talentProfileId: string, workSessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('talent_work_sessions')
    .insert({
      talent_profile_id: talentProfileId,
      work_session_id: workSessionId,
    });

  if (error && !error.message.includes('duplicate')) {
    throw new Error(`Failed to link session to profile: ${error.message}`);
  }
};

export const getTalentWorkSessions = async (talentProfileId: string): Promise<WorkSession[]> => {
  const { data, error } = await supabase
    .from('talent_work_sessions')
    .select('work_session_id')
    .eq('talent_profile_id', talentProfileId);

  if (error) {
    console.error('Error fetching talent work sessions:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const sessionIds = data.map((d) => d.work_session_id);
  
  const { data: sessions, error: sessionsError } = await supabase
    .from('work_sessions')
    .select('*')
    .in('id', sessionIds)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching work sessions:', sessionsError);
    return [];
  }

  return sessions as unknown as WorkSession[];
};

export const getTalentEvidencePacks = async (talentProfileId: string): Promise<{ session: WorkSession; pack: EvidencePackSummary }[]> => {
  const sessions = await getTalentWorkSessions(talentProfileId);
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const results: { session: WorkSession; pack: EvidencePackSummary }[] = [];

  for (const session of completedSessions) {
    const { data: pack } = await supabase
      .from('evidence_packs')
      .select('summary_json')
      .eq('session_id', session.id)
      .single();

    if (pack) {
      results.push({
        session,
        pack: pack.summary_json as unknown as EvidencePackSummary,
      });
    }
  }

  return results;
};

export const consolidateTalentProfile = async (talentProfileId: string): Promise<TalentProfile> => {
  const { data, error } = await supabase.functions.invoke('consolidate-talent-profile', {
    body: { talentProfileId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to consolidate profile');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.profile;
};

export interface UpdateTalentProfileInput {
  name?: string;
  email?: string;
}

export const updateTalentProfile = async (
  talentId: string,
  input: UpdateTalentProfileInput
): Promise<TalentProfile> => {
  const { data, error } = await supabase
    .from('talent_profiles')
    .update({
      name: input.name,
      email: input.email,
      last_updated_at: new Date().toISOString(),
    })
    .eq('id', talentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update talent profile: ${error.message}`);
  }

  return data as unknown as TalentProfile;
};

// Fetch GitHub evidence (raw data from repos)
export const fetchGitHubEvidence = async (githubUrl: string): Promise<string | null> => {
  const { data, error } = await supabase.functions.invoke('fetch-github-evidence', {
    body: { githubUrl },
  });

  if (error) {
    console.error('Error fetching GitHub evidence:', error);
    return null;
  }

  return data?.rawEvidence || null;
};

// Analyze GitHub profile and generate brief
export interface GitHubBrief {
  candidateName: string;
  verdict: 'pass' | 'fail';
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
  workArtifacts: Array<{
    id: string;
    title: string;
    url?: string;
    whatItIs: string;
    whyItMatters: string;
    signals: string[];
  }>;
  signalSynthesis: Array<{
    name: string;
    level: 'high' | 'medium' | 'low';
    evidence: string;
  }>;
  risksUnknowns: Array<{
    id: string;
    description: string;
  }>;
  validationPlan: {
    riskToValidate: string;
    question: string;
    strongAnswer: string;
  };
  recommendation: {
    verdict: 'pass' | 'fail';
    reasons: string[];
  };
}

export const analyzeGitHubProfile = async (
  githubUrl: string,
  rawEvidence: string
): Promise<GitHubBrief | null> => {
  const { data, error } = await supabase.functions.invoke('analyze-candidate', {
    body: { githubUrl, rawWorkEvidence: rawEvidence },
  });

  if (error) {
    console.error('Error analyzing GitHub profile:', error);
    return null;
  }

  return data?.brief || null;
};

// Transform GitHub brief into ConsolidatedProfile format
export const transformBriefToProfile = (brief: GitHubBrief): Partial<ConsolidatedProfile> => {
  // Extract strengths from high-level signals
  const strengths: string[] = [];
  brief.signalSynthesis.forEach((signal) => {
    if (signal.level === 'high') {
      strengths.push(`Strong ${signal.name}: ${signal.evidence}`);
    }
  });

  // Add strengths from work artifacts
  brief.workArtifacts.forEach((artifact) => {
    if (artifact.whyItMatters) {
      strengths.push(artifact.whyItMatters);
    }
  });

  // Extract areas for growth from risks/unknowns and low signals
  const areasForGrowth: string[] = [];
  brief.risksUnknowns.forEach((risk) => {
    areasForGrowth.push(risk.description);
  });

  brief.signalSynthesis.forEach((signal) => {
    if (signal.level === 'low') {
      areasForGrowth.push(`${signal.name}: ${signal.evidence}`);
    }
  });

  return {
    summary: brief.rationale,
    strengths: strengths.slice(0, 5), // Max 5 strengths
    areasForGrowth: areasForGrowth.slice(0, 5), // Max 5 areas for growth
    signals: brief.signalSynthesis.map((s) => ({
      name: s.name as unknown as 'problemSolving' | 'collaboration' | 'communication' | 'technicalDepth' | 'ownership' | 'adaptability',
      level: s.level,
      evidence: s.evidence,
    })),
    verdict: brief.verdict,
    confidence: brief.confidence,
    totalTestsTaken: 0,
  };
};

// Full GitHub analysis flow for onboarding
export const analyzeGitHubForOnboarding = async (
  talentId: string,
  githubUrl: string
): Promise<TalentProfile | null> => {
  try {
    // Step 1: Fetch GitHub evidence
    const rawEvidence = await fetchGitHubEvidence(githubUrl);
    if (!rawEvidence) {
      console.warn('No GitHub evidence found');
      return null;
    }

    // Step 2: Analyze with AI
    const brief = await analyzeGitHubProfile(githubUrl, rawEvidence);
    if (!brief) {
      console.warn('Failed to analyze GitHub profile');
      return null;
    }

    // Step 3: Transform to profile format
    const profileData = transformBriefToProfile(brief);

    // Step 4: Update profile in database
    const { data, error } = await supabase
      .from('talent_profiles')
      .update({
        consolidated_profile: profileData as unknown as Json,
        name: brief.candidateName || undefined,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', talentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile with GitHub analysis:', error);
      return null;
    }

    return data as unknown as TalentProfile;
  } catch (error) {
    console.error('Error in GitHub analysis flow:', error);
    return null;
  }
};

// Suggest tests based on weaknesses using AI
export interface SuggestedTest {
  testId: 'backend' | 'frontend' | 'fullstack';
  testName: string;
  reason: string;
}

export const suggestTestsForWeaknesses = async (
  areasForGrowth: string[]
): Promise<SuggestedTest[]> => {
  if (!areasForGrowth || areasForGrowth.length === 0) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke('suggest-tests-for-weaknesses', {
    body: { areasForGrowth },
  });

  if (error) {
    console.error('Error suggesting tests:', error);
    return [];
  }

  return data?.suggestedTests || [];
};
