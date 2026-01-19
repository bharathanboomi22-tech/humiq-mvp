import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

export function useSpeechSynthesis(options: SpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const {
    lang = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    voiceName,
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices
  useEffect(() => {
    if (!isSupported) return;

    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || [];
      setVoices(availableVoices);
    };

    // Load voices immediately and on change
    loadVoices();
    
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  // Find the best voice for the language
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // If specific voice name requested
    if (voiceName) {
      const namedVoice = voices.find(v => v.name === voiceName);
      if (namedVoice) return namedVoice;
    }

    // Find a voice matching the language
    const langVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    
    // Prefer Google or Microsoft voices for quality
    const preferredVoice = langVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Microsoft') ||
      v.name.includes('Samantha') || // macOS
      v.name.includes('Daniel') // macOS
    );
    
    if (preferredVoice) return preferredVoice;
    
    // Fall back to any voice for the language
    if (langVoices.length > 0) return langVoices[0];
    
    // Last resort: first available voice
    return voices[0] || null;
  }, [voices, lang, voiceName]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !synthRef.current) {
      onError?.('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voice = getVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      // Ignore 'interrupted' errors (caused by cancel())
      if (event.error !== 'interrupted') {
        onError?.(`Speech synthesis error: ${event.error}`);
      }
    };

    utteranceRef.current = utterance;

    // Chrome bug fix: need to call getVoices() before speaking
    synthRef.current.getVoices();
    
    synthRef.current.speak(utterance);
  }, [isSupported, lang, rate, pitch, volume, getVoice, onStart, onEnd, onError]);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    speak,
    cancel,
    pause,
    resume,
  };
}

// Helper hook for getting available voices
export function useAvailableVoices(lang?: string): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      
      if (lang) {
        availableVoices = availableVoices.filter(v => 
          v.lang.startsWith(lang.split('-')[0])
        );
      }
      
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang]);

  return voices;
}
