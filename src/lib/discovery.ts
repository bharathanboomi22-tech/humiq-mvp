import { supabase } from '@/integrations/supabase/client';
import { DiscoverySession, DiscoveryProfile, DiscoveryMessage } from '@/types/talent';
import { Json } from '@/integrations/supabase/types';

export async function createDiscoverySession(talentProfileId: string): Promise<DiscoverySession> {
  const { data, error } = await supabase
    .from('discovery_conversations')
    .insert({
      talent_profile_id: talentProfileId,
      messages: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create discovery session: ${error.message}`);
  }

  return {
    id: data.id,
    talent_profile_id: data.talent_profile_id,
    messages: (data.messages as unknown as DiscoveryMessage[]) || [],
    completed_at: data.completed_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function getDiscoverySession(sessionId: string): Promise<DiscoverySession | null> {
  const { data, error } = await supabase
    .from('discovery_conversations')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching discovery session:', error);
    return null;
  }

  return {
    id: data.id,
    talent_profile_id: data.talent_profile_id,
    messages: (data.messages as unknown as DiscoveryMessage[]) || [],
    completed_at: data.completed_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function getLatestDiscoverySession(talentProfileId: string): Promise<DiscoverySession | null> {
  const { data, error } = await supabase
    .from('discovery_conversations')
    .select('*')
    .eq('talent_profile_id', talentProfileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No session found is not an error
    return null;
  }

  return {
    id: data.id,
    talent_profile_id: data.talent_profile_id,
    messages: (data.messages as unknown as DiscoveryMessage[]) || [],
    completed_at: data.completed_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function appendDiscoveryMessage(
  sessionId: string,
  role: 'ai' | 'user',
  content: string
): Promise<void> {
  // Get current messages
  const { data: session, error: fetchError } = await supabase
    .from('discovery_conversations')
    .select('messages')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch session: ${fetchError.message}`);
  }

  const messages = (session.messages as unknown as DiscoveryMessage[]) || [];
  messages.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  const { error: updateError } = await supabase
    .from('discovery_conversations')
    .update({ messages: messages as unknown as Json, updated_at: new Date().toISOString() })
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
