import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: (transcript: string) => void;
  onError?: (error: string) => void;
  silenceTimeout?: number; // ms to wait before auto-stopping after silence
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Browser SpeechRecognition type
type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

// Check for browser support
const getSpeechRecognition = (): SpeechRecognitionType | null => {
  if (typeof window === 'undefined') return null;
  
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onEnd,
    onError,
    silenceTimeout = 5000, // Increased default timeout
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef(''); // Keep track of transcript for onEnd callback
  const isListeningRef = useRef(false);
  const manualStopRef = useRef(false);
  
  const isSupported = getSpeechRecognition() !== null;

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Reset silence timer - only start after first speech detected
  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    if (silenceTimeout > 0 && transcriptRef.current.length > 0) {
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && isListeningRef.current) {
          console.log('Silence timeout - stopping recognition');
          manualStopRef.current = true;
          recognitionRef.current.stop();
        }
      }, silenceTimeout);
    }
  }, [clearSilenceTimer, silenceTimeout]);

  // Initialize recognition only once
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
        setTranscript(transcriptRef.current);
        onResult?.(finalTranscript, true);
        // Start/reset silence timer only after we have speech
        resetSilenceTimer();
      }
      
      setInterimTranscript(interimText);
      if (interimText) {
        onResult?.(interimText, false);
        // Also reset timer on interim results (user is speaking)
        resetSilenceTimer();
      }
    };

    recognition.onstart = () => {
      console.log('Speech recognition started');
      isListeningRef.current = true;
      manualStopRef.current = false;
      setIsListening(true);
      setError(null);
      // Don't start silence timer here - wait for first speech
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, transcript:', transcriptRef.current);
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
      clearSilenceTimer();
      
      // Only call onEnd if we have a transcript and it was a manual/timeout stop
      if (transcriptRef.current.trim() && manualStopRef.current) {
        onEnd?.(transcriptRef.current.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);
      
      // 'no-speech' is not really an error, just means no speech was detected
      if (event.error === 'no-speech') {
        // Restart if we're supposed to be listening
        if (isListeningRef.current && !manualStopRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }
        return;
      }
      
      // 'aborted' happens when we stop manually
      if (event.error === 'aborted') {
        return;
      }

      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      isListeningRef.current = false;
      setIsListening(false);
      clearSilenceTimer();
      onError?.(errorMessage);
    };

    // Handle audio start/end for better feedback
    recognition.onaudiostart = () => {
      console.log('Audio capturing started');
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
      // Start silence timer when speech ends
      if (transcriptRef.current.length > 0) {
        resetSilenceTimer();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      manualStopRef.current = true;
      try {
        recognition.stop();
      } catch (e) {
        // Already stopped
      }
    };
  }, [lang, continuous, interimResults]); // Reduced dependencies

  // Update callbacks when they change
  useEffect(() => {
    // Store callbacks in refs if needed, but for now the closure should work
  }, [onResult, onEnd, onError, resetSilenceTimer, clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    // Reset state
    setError(null);
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    manualStopRef.current = false;

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Already started - try to restart
      console.warn('Recognition already started, restarting...');
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }, 100);
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    manualStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
  }, [clearSilenceTimer]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Helper to get user-friendly error messages
function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your audio settings.';
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone access.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    case 'language-not-supported':
      return 'Language not supported.';
    case 'service-not-allowed':
      return 'Speech recognition service not allowed.';
    default:
      return `Speech recognition error: ${error}`;
  }
}
