import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  /** Base speed in ms per character */
  speed?: number;
  /** Random variance to add (0-1, e.g. 0.3 = ±30%) */
  variance?: number;
  /** Delay before starting in ms */
  startDelay?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayText: string;
  isTyping: boolean;
  isComplete: boolean;
  start: () => void;
  reset: () => void;
}

/**
 * Character-by-character typewriter effect with natural variance
 */
export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const {
    speed = 35,
    variance = 0.4,
    startDelay = 0,
    onComplete,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  const start = useCallback(() => {
    setShouldStart(true);
  }, []);

  const reset = useCallback(() => {
    setDisplayText('');
    setCharIndex(0);
    setIsTyping(false);
    setIsComplete(false);
    setShouldStart(false);
  }, []);

  // Handle start delay
  useEffect(() => {
    if (!shouldStart) return;

    const timer = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [shouldStart, startDelay]);

  // Type characters one by one
  useEffect(() => {
    if (!isTyping || charIndex >= text.length) return;

    // Calculate delay with natural variance
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
    const charDelay = Math.round(speed * randomFactor);

    const timer = setTimeout(() => {
      setDisplayText(text.slice(0, charIndex + 1));
      setCharIndex((prev) => prev + 1);
    }, charDelay);

    return () => clearTimeout(timer);
  }, [isTyping, charIndex, text, speed, variance]);

  // Handle completion
  useEffect(() => {
    if (charIndex >= text.length && isTyping) {
      setIsTyping(false);
      setIsComplete(true);
      onComplete?.();
    }
  }, [charIndex, text.length, isTyping, onComplete]);

  return {
    displayText,
    isTyping,
    isComplete,
    start,
    reset,
  };
}

interface MultiLineState {
  currentLineIndex: number;
  completedLines: string[];
  currentLineText: string;
  isTypingLine: boolean;
  charIndex: number;
}

/**
 * Multi-line typewriter that types lines sequentially with infinite loop
 */
export function useMultiLineTypewriter(
  lines: string[],
  options: {
    charSpeed?: number;
    variance?: number;
    linePause?: number;
    initialDelay?: number;
    loopDelay?: number;
  } = {}
) {
  const {
    charSpeed = 30,
    variance = 0.35,
    linePause = 400,
    initialDelay = 600,
    loopDelay = 2000,
  } = options;

  const [state, setState] = useState<MultiLineState>({
    currentLineIndex: -1,
    completedLines: [],
    currentLineText: '',
    isTypingLine: false,
    charIndex: 0,
  });

  const linesRef = useRef(lines);
  const timerRef = useRef<number | null>(null);

  // Clear any pending timer
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset when lines change
  useEffect(() => {
    const linesChanged = JSON.stringify(lines) !== JSON.stringify(linesRef.current);
    linesRef.current = lines;

    if (linesChanged) {
      clearTimer();
      setState({
        currentLineIndex: -1,
        completedLines: [],
        currentLineText: '',
        isTypingLine: false,
        charIndex: 0,
      });
    }
  }, [lines, clearTimer]);

  // Start typing after initial delay
  useEffect(() => {
    if (state.currentLineIndex === -1 && lines.length > 0) {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentLineIndex: 0,
          isTypingLine: true,
          charIndex: 0,
          currentLineText: '',
        }));
      }, initialDelay);
    }

    return clearTimer;
  }, [state.currentLineIndex, lines.length, initialDelay, clearTimer]);

  // Main typing effect
  useEffect(() => {
    if (!state.isTypingLine || state.currentLineIndex < 0 || state.currentLineIndex >= lines.length) {
      return;
    }

    const currentLine = lines[state.currentLineIndex];

    // Check if line is complete
    if (state.charIndex >= currentLine.length) {
      clearTimer();
      
      // Mark line as complete
      setState(prev => ({
        ...prev,
        isTypingLine: false,
        completedLines: [...prev.completedLines, currentLine],
        currentLineText: '',
      }));

      // Schedule next line or loop restart
      const isLastLine = state.currentLineIndex >= lines.length - 1;
      const delay = isLastLine ? loopDelay : linePause;

      timerRef.current = window.setTimeout(() => {
        if (isLastLine) {
          // Restart loop
          setState({
            currentLineIndex: 0,
            completedLines: [],
            currentLineText: '',
            isTypingLine: true,
            charIndex: 0,
          });
        } else {
          // Move to next line
          setState(prev => ({
            ...prev,
            currentLineIndex: prev.currentLineIndex + 1,
            isTypingLine: true,
            charIndex: 0,
            currentLineText: '',
          }));
        }
      }, delay);

      return;
    }

    // Type next character
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
    const charDelay = Math.round(charSpeed * randomFactor);

    timerRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentLineText: currentLine.slice(0, prev.charIndex + 1),
        charIndex: prev.charIndex + 1,
      }));
    }, charDelay);

    return clearTimer;
  }, [
    state.isTypingLine,
    state.currentLineIndex,
    state.charIndex,
    lines,
    charSpeed,
    variance,
    linePause,
    loopDelay,
    clearTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    completedLines: state.completedLines,
    currentLineText: state.currentLineText,
    currentLineIndex: state.currentLineIndex,
    isTyping: state.isTypingLine,
    isAllComplete: false,
  };
}
