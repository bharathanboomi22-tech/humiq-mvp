import { useState, useEffect, useCallback } from 'react';

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

/**
 * Multi-line typewriter that types lines sequentially
 */
export function useMultiLineTypewriter(
  lines: string[],
  options: {
    charSpeed?: number;
    variance?: number;
    linePause?: number;
    initialDelay?: number;
  } = {}
) {
  const {
    charSpeed = 30,
    variance = 0.35,
    linePause = 400,
    initialDelay = 600,
  } = options;

  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState('');
  const [isTypingLine, setIsTypingLine] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  // Start first line after initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  // Reset when lines change
  useEffect(() => {
    setCurrentLineIndex(-1);
    setCompletedLines([]);
    setCurrentLineText('');
    setIsTypingLine(false);
    setCharIndex(0);

    const timer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [lines, initialDelay]);

  // Start typing when line index changes
  useEffect(() => {
    if (currentLineIndex < 0 || currentLineIndex >= lines.length) return;

    setCharIndex(0);
    setCurrentLineText('');
    setIsTypingLine(true);
  }, [currentLineIndex, lines]);

  // Type characters
  useEffect(() => {
    if (!isTypingLine || currentLineIndex < 0 || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    
    if (charIndex >= currentLine.length) {
      // Line complete
      setIsTypingLine(false);
      setCompletedLines((prev) => [...prev, currentLine]);
      setCurrentLineText('');
      
      // Move to next line after pause
      if (currentLineIndex < lines.length - 1) {
        const timer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setCharIndex(0);
        }, linePause);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Calculate delay with natural variance
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
    const charDelay = Math.round(charSpeed * randomFactor);

    const timer = setTimeout(() => {
      setCurrentLineText(currentLine.slice(0, charIndex + 1));
      setCharIndex((prev) => prev + 1);
    }, charDelay);

    return () => clearTimeout(timer);
  }, [isTypingLine, charIndex, currentLineIndex, lines, charSpeed, variance, linePause]);

  return {
    completedLines,
    currentLineText,
    currentLineIndex,
    isTyping: isTypingLine,
    isAllComplete: currentLineIndex >= lines.length - 1 && !isTypingLine && completedLines.length === lines.length,
  };
}
