import { supabase } from '@/integrations/supabase/client';
import {
  CreateWorkSessionInput,
  CreateWorkSessionResponse,
  AddSessionEventInput,
  GetNextPromptInput,
  GetNextPromptResponse,
  CompleteSessionResponse,
  EvidencePackSummary,
  WorkSession,
  EventType,
  EventContent,
  StageName,
} from '@/types/workSession';

interface GetEvidencePackResponse {
  id: string;
  sessionId: string;
  shareId: string;
  summaryJson: EvidencePackSummary;
  generatedAt: string;
  session: WorkSession;
}

export async function createWorkSession(
  input: CreateWorkSessionInput
): Promise<CreateWorkSessionResponse> {
  const { data, error } = await supabase.functions.invoke<CreateWorkSessionResponse>(
    'create-work-session',
    {
      body: {
        githubUrl: input.githubUrl,
        roleTrack: input.roleTrack,
        level: input.level,
        duration: input.duration,
      },
    }
  );

  if (error) {
    console.error('Error creating work session:', error);
    throw new Error(error.message || 'Failed to create work session');
  }

  if (!data) {
    throw new Error('No data returned from create work session');
  }

  return data;
}

export async function addSessionEvent(
  sessionId: string,
  eventType: EventType,
  content: EventContent
): Promise<{ success: boolean; eventId: string }> {
  const { data, error } = await supabase.functions.invoke<{ success: boolean; eventId: string }>(
    'work-session-event',
    {
      body: {
        sessionId,
        eventType,
        content,
      },
    }
  );

  if (error) {
    console.error('Error adding session event:', error);
    throw new Error(error.message || 'Failed to add session event');
  }

  if (!data) {
    throw new Error('No data returned from add session event');
  }

  return data;
}

export async function getNextPrompt(
  sessionId: string,
  currentStage: StageName,
  candidateResponse?: string
): Promise<GetNextPromptResponse> {
  const { data, error } = await supabase.functions.invoke<GetNextPromptResponse>(
    'work-session-next-prompt',
    {
      body: {
        sessionId,
        currentStage,
        candidateResponse,
      },
    }
  );

  if (error) {
    console.error('Error getting next prompt:', error);
    throw new Error(error.message || 'Failed to get next prompt');
  }

  if (!data) {
    throw new Error('No data returned from get next prompt');
  }

  return data;
}

export async function completeSession(sessionId: string): Promise<CompleteSessionResponse> {
  const { data, error } = await supabase.functions.invoke<CompleteSessionResponse>(
    'complete-work-session',
    {
      body: { sessionId },
    }
  );

  if (error) {
    console.error('Error completing session:', error);
    throw new Error(error.message || 'Failed to complete session');
  }

  if (!data) {
    throw new Error('No data returned from complete session');
  }

  return data;
}

export async function getEvidencePack(
  identifier: { shareId: string } | { sessionId: string }
): Promise<GetEvidencePackResponse> {
  const { data, error } = await supabase.functions.invoke<GetEvidencePackResponse>(
    'get-evidence-pack',
    {
      body: identifier,
    }
  );

  if (error) {
    console.error('Error getting evidence pack:', error);
    throw new Error(error.message || 'Failed to get evidence pack');
  }

  if (!data) {
    throw new Error('No data returned from get evidence pack');
  }

  return data;
}

// Helper to get session from Supabase directly (for live page)
export async function getWorkSession(sessionId: string): Promise<WorkSession | null> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching work session:', error);
    return null;
  }

  return data as WorkSession;
}
