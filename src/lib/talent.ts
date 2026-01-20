import { supabase } from '@/integrations/supabase/client';
import { TalentProfile, ConsolidatedProfile } from '@/types/talent';
import { WorkSession, EvidencePackSummary } from '@/types/workSession';

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

  return data as TalentProfile;
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

  return data as TalentProfile;
};

export const getOrCreateTalentProfile = async (githubUrl: string): Promise<TalentProfile> => {
  // Check if profile already exists for this GitHub URL
  const { data: existing } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('github_url', githubUrl)
    .single();

  if (existing) {
    return existing as TalentProfile;
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

  return sessions as WorkSession[];
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
        pack: pack.summary_json as EvidencePackSummary,
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

  return data as TalentProfile;
};
