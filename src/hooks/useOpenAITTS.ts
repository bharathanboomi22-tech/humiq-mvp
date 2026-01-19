import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface UseOpenAITTSOptions {
  voice?: OpenAIVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseOpenAITTSReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  speak: (text: string) => Promise<void>;
  cancel: () => void;
}

export function useOpenAITTS(options: UseOpenAITTSOptions = {}): UseOpenAITTSReturn {
  const {
    voice = 'echo',
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Cancel any existing speech
    cancel();

    setError(null);
    setIsLoading(true);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      console.log('Requesting TTS for:', text.substring(0, 50) + '...');

      // Call the Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke<{
        audio: string;
        format: string;
      }>('text-to-speech', {
        body: { text, voice },
      });

      // Check if cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to generate speech');
      }

      if (!data?.audio) {
        throw new Error('No audio data received');
      }

      // Use data URI - browser natively decodes base64 audio without corruption
      const audioUrl = `data:audio/mpeg;base64,${data.audio}`;

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        onStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        onEnd?.();
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        setIsLoading(false);
        audioRef.current = null;
        const errorMsg = 'Failed to play audio';
        setError(errorMsg);
        onError?.(errorMsg);
      };

      // Start playback
      await audio.play();

    } catch (err) {
      // Check if it was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('TTS error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMsg);
      setIsLoading(false);
      setIsSpeaking(false);
      onError?.(errorMsg);
    }
  }, [voice, cancel, onStart, onEnd, onError]);

  return {
    isSpeaking,
    isLoading,
    error,
    speak,
    cancel,
  };
}
