import { supabase } from '@/integrations/supabase/client';
import { DiscoverySession, DiscoveryProfile } from '@/types/talent';

export async function createDiscoverySession(talentProfileId: string): Promise<DiscoverySession> {
  const { data, error } = await (supabase
    .from('discovery_sessions') as any)
    .insert({
      talent_profile_id: talentProfileId,
      status: 'in_progress',
      transcript: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create discovery session: ${error.message}`);
  }

  return data as DiscoverySession;
}

export async function getDiscoverySession(sessionId: string): Promise<DiscoverySession | null> {
  const { data, error } = await (supabase
    .from('discovery_sessions') as any)
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching discovery session:', error);
    return null;
  }

  return data as DiscoverySession;
}

export async function getLatestDiscoverySession(talentProfileId: string): Promise<DiscoverySession | null> {
  const { data, error } = await (supabase
    .from('discovery_sessions') as any)
    .select('*')
    .eq('talent_profile_id', talentProfileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No session found is not an error
    return null;
  }

  return data as DiscoverySession;
}

export async function appendDiscoveryMessage(
  sessionId: string,
  role: 'ai' | 'user',
  content: string
): Promise<void> {
  // Get current transcript
  const { data: session, error: fetchError } = await (supabase
    .from('discovery_sessions') as any)
    .select('transcript')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch session: ${fetchError.message}`);
  }

  const transcript = session.transcript || [];
  transcript.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  const { error: updateError } = await (supabase
    .from('discovery_sessions') as any)
    .update({ transcript })
    .eq('id', sessionId);

  if (updateError) {
    throw new Error(`Failed to append message: ${updateError.message}`);
  }
}

export async function completeDiscoverySession(sessionId: string): Promise<DiscoveryProfile> {
  const { data, error } = await supabase.functions.invoke('complete-discovery-session', {
    body: { sessionId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to complete discovery session');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.discoveryProfile;
}

export async function getNextDiscoveryPrompt(
  sessionId: string,
  talentProfileId: string,
  userResponse?: string
): Promise<{ prompt: string; isComplete: boolean }> {
  const { data, error } = await supabase.functions.invoke('discovery-session-prompt', {
    body: { sessionId, talentProfileId, userResponse },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get next prompt');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    prompt: data.prompt,
    isComplete: data.isComplete || false,
  };
}
