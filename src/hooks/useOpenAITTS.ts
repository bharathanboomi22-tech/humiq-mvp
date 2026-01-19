import { useState, useRef, useCallback } from 'react';

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
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Check browser support
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      const errorMsg = 'Speech synthesis not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Cancel any existing speech
    cancel();

    setError(null);
    setIsLoading(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure voice settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to get a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        // Ignore 'interrupted' errors (caused by cancel)
        if (e.error === 'interrupted') {
          return;
        }
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
        setIsLoading(false);
        utteranceRef.current = null;
        const errorMsg = `Speech synthesis error: ${e.error}`;
        setError(errorMsg);
        onError?.(errorMsg);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('TTS error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMsg);
      setIsLoading(false);
      setIsSpeaking(false);
      onError?.(errorMsg);
    }
  }, [cancel, onStart, onEnd, onError]);

  return {
    isSpeaking,
    isLoading,
    error,
    speak,
    cancel,
  };
}
