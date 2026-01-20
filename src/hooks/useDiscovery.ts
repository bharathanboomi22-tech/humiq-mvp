import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getStoredTalentId } from '@/lib/talent';
import { runMatchingForTalent } from '@/lib/matching';
import { DiscoveryMessage } from '@/components/discovery/ChatMessage';

export interface DiscoveryAnswer {
  questionId: string;
  question: string;
  answer: string;
}

interface UseDiscoveryReturn {
  messages: DiscoveryMessage[];
  answers: DiscoveryAnswer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  isLoading: boolean;
  isComplete: boolean;
  isSaving: boolean;
  startDiscovery: (onboardingData: any) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  completeDiscovery: () => Promise<boolean>;
}

export const useDiscovery = (): UseDiscoveryReturn => {
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [answers, setAnswers] = useState<DiscoveryAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6); // 5-8 questions max
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: DiscoveryMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const startDiscovery = useCallback(async (onboardingData: any) => {
    setIsLoading(true);

    try {
      // Create discovery conversation
      const talentId = getStoredTalentId();
      if (!talentId) {
        throw new Error('Talent profile not found');
      }

      const { data: conv, error: convError } = await supabase
        .from('discovery_conversations')
        .insert({
          talent_profile_id: talentId,
          messages: [],
        })
        .select()
        .single();

      if (convError) throw convError;
      setConversationId(conv.id);

      // Call edge function to get first question
      const { data: response, error } = await supabase.functions.invoke('discovery-conversation', {
        body: {
          action: 'start',
          onboardingData,
          conversationId: conv.id,
        },
      });

      if (error) throw error;
      if (response?.error) throw new Error(response.error);

      // Add intro message
      const introMessage = response.intro || "Hi! I'm here to get to know you better and understand your work style. I'll ask a few questions to help determine your profile and skills.";
      addMessage('assistant', introMessage);

      // Add first question
      await new Promise((resolve) => setTimeout(resolve, 800));
      const firstQuestion = response.question;
      const questionId = response.questionId;
      addMessage('assistant', firstQuestion);

      setTotalQuestions(response.totalQuestions || 6);
      setCurrentQuestionIndex(0);
    } catch (error: any) {
      console.error('Error starting discovery:', error);
      toast.error(error.message || 'Failed to start discovery');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || isLoading || !conversationId) return;

    const talentId = getStoredTalentId();
    if (!talentId) return;

    // Add user's answer
    addMessage('user', answer);

    setIsLoading(true);

    try {
      // Call edge function to get next question or complete
      const { data: response, error } = await supabase.functions.invoke('discovery-conversation', {
        body: {
          action: 'continue',
          conversationId,
          answer: answer.trim(),
          questionIndex: currentQuestionIndex,
        },
      });

      if (error) throw error;
      if (response?.error) throw new Error(response.error);

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check if the response needs clarification (invalid answer)
      if (response.needsClarification) {
        // Add clarification message - do NOT advance question index
        addMessage('assistant', response.clarificationMessage);
        // Don't store the invalid answer
        return;
      }

      // Valid response - store the answer
      const currentQuestion = messages.filter(m => m.role === 'assistant').pop()?.content || '';
      setAnswers((prev) => [
        ...prev,
        {
          questionId: `q${currentQuestionIndex}`,
          question: currentQuestion,
          answer: answer.trim(),
        },
      ]);

      if (response.complete) {
        addMessage('assistant', response.completionMessage || 'Thank you! I have everything I need to understand your profile.');
        setIsComplete(true);
      } else {
        addMessage('assistant', response.question);
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestionIndex, conversationId, isLoading, addMessage, messages]);

  const completeDiscovery = useCallback(async (): Promise<boolean> => {
    if (!conversationId || !isComplete) return false;

    setIsSaving(true);
    const talentId = getStoredTalentId();
    if (!talentId) return false;

    try {
      // Update conversation as completed
      await supabase
        .from('discovery_conversations')
        .update({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Call edge function to update profile from discovery
      const { data: response, error } = await supabase.functions.invoke('update-profile-from-discovery', {
        body: {
          talentProfileId: talentId,
          conversationId,
          answers,
        },
      });

      if (error) throw error;
      if (response?.error) throw new Error(response.error);

      // Mark discovery as completed
      await supabase
        .from('talent_profiles')
        .update({
          discovery_completed: true,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', talentId);

      // Trigger matching to create matches and interview requests
      try {
        await runMatchingForTalent(talentId);
      } catch (error: any) {
        console.error('Error triggering matching:', error);
        // Don't fail the discovery completion if matching fails
        toast.error('Profile updated, but matching failed. Please try refreshing.');
      }

      return true;
    } catch (error: any) {
      console.error('Error completing discovery:', error);
      toast.error(error.message || 'Failed to complete discovery');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [conversationId, isComplete, messages, answers]);

  return {
    messages,
    answers,
    currentQuestionIndex,
    totalQuestions,
    isLoading,
    isComplete,
    isSaving,
    startDiscovery,
    submitAnswer,
    completeDiscovery,
  };
};
