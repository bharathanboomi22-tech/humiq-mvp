import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AIMessageOrb } from './AIMessageOrb';

interface Message {
  id: number;
  lines: string[];
}

const MESSAGES: Message[] = [
  { id: 1, lines: ["I'm not here to read your CV."] },
  { id: 2, lines: ["I'm interested in how you think,", "decide,", "and solve — in real situations."] },
  { id: 3, lines: ["No keywords.", "No applications."] },
  { id: 4, lines: ["Show me something you've worked on."] },
  { id: 5, lines: ["It doesn't have to be perfect.", "Just real."] },
];

// Typing speed configuration
const CHAR_DELAY = 35; // ms per character
const LINE_PAUSE = 150; // pause between lines
const MESSAGE_PAUSE = 600; // pause between messages
const INITIAL_DELAY = 800; // delay before starting

export function AIDialogueCard() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setUserType } = useAuth();

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [completedMessages, setCompletedMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [showCTA, setShowCTA] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Handle skip animation
  const handleSkip = useCallback(() => {
    if (!skipped && !showCTA) {
      setSkipped(true);
      setCompletedMessages(MESSAGES.map(m => m.id));
      setCurrentMessageIndex(MESSAGES.length);
      setShowCTA(true);
      setShowCursor(false);
    }
  }, [skipped, showCTA]);

  // Cursor blink effect
  useEffect(() => {
    if (skipped || showCTA) {
      setShowCursor(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [skipped, showCTA]);

  // Typing animation
  useEffect(() => {
    if (shouldReduceMotion || skipped) {
      setCompletedMessages(MESSAGES.map(m => m.id));
      setShowCTA(true);
      setShowCursor(false);
      return;
    }

    if (currentMessageIndex >= MESSAGES.length && completedMessages.length === MESSAGES.length) {
      // All messages complete - show CTA
      if (!showCTA) {
        setShowCTA(true);
        setShowCursor(false);
      }
      return;
    }

    const currentMessage = MESSAGES[currentMessageIndex];
    const currentLine = currentMessage?.lines[currentLineIndex];

    // Initial delay - auto-start typing on mount
    if (currentMessageIndex === 0 && currentLineIndex === 0 && currentCharIndex === 0 && !isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(true);
      }, INITIAL_DELAY);
      return () => clearTimeout(timeout);
    }

    // Skip if not typing yet for the first message
    if (!isTyping || !currentLine) return;

    if (currentCharIndex < currentLine.length) {
      // Type next character
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(timeout);
    } else if (currentLineIndex < currentMessage.lines.length - 1) {
      // Move to next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, LINE_PAUSE);
      return () => clearTimeout(timeout);
    } else {
      // Message complete, move to next message
      const timeout = setTimeout(() => {
        setCompletedMessages(prev => [...prev, currentMessage.id]);
        if (currentMessageIndex < MESSAGES.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentLineIndex(0);
          setCurrentCharIndex(0);
        } else {
          // All messages done
          setTimeout(() => {
            setShowCTA(true);
            setShowCursor(false);
          }, 300);
        }
      }, MESSAGE_PAUSE);
      return () => clearTimeout(timeout);
    }
  }, [currentMessageIndex, currentLineIndex, currentCharIndex, isTyping, skipped, shouldReduceMotion]);

  const handleStartClick = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  // Get display text for current message
  const getDisplayText = (message: Message) => {
    if (completedMessages.includes(message.id)) {
      return message.lines.join(' ');
    }

    if (MESSAGES[currentMessageIndex]?.id !== message.id) {
      return '';
    }

    let text = '';
    for (let i = 0; i <= currentLineIndex; i++) {
      if (i < currentLineIndex) {
        text += message.lines[i] + ' ';
      } else {
        text += message.lines[i].substring(0, currentCharIndex);
      }
    }
    return text;
  };

  const getOrbState = (messageId: number) => {
    if (completedMessages.includes(messageId)) return 'complete';
    if (MESSAGES[currentMessageIndex]?.id === messageId) {
      return isTyping ? 'typing' : 'thinking';
    }
    return 'idle';
  };

  return (
    <motion.div
      onClick={handleSkip}
      className="relative w-full max-w-[420px] mx-auto cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Card */}
      <div
        className="relative rounded-[20px] p-6 md:p-7"
        style={{
          background: '#FFFFFF',
          boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.08), 0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <AIMessageOrb state="complete" size={20} />
          <div>
            <p 
              className="text-sm font-semibold"
              style={{ color: '#0B0B0D' }}
            >
              HumiQ AI
            </p>
            <p 
              className="text-xs"
              style={{ color: '#8A8F98' }}
            >
              Personal Career Intelligence
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {MESSAGES.map((message) => {
            const displayText = getDisplayText(message);
            const isCurrentMessage = MESSAGES[currentMessageIndex]?.id === message.id;
            const isCompleted = completedMessages.includes(message.id);
            const shouldShow = isCompleted || (isCurrentMessage && isTyping) || skipped;

            if (!shouldShow) return null;

            return (
              <motion.div
                key={message.id}
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <AIMessageOrb 
                  state={getOrbState(message.id)} 
                  size={16} 
                />
                <p
                  className="text-[15px] leading-relaxed flex-1"
                  style={{ color: '#0B0B0D' }}
                >
                  {displayText}
                  {/* Cursor */}
                  {MESSAGES[currentMessageIndex]?.id === message.id && 
                   !completedMessages.includes(message.id) && (
                    <span 
                      className="inline-block w-[2px] h-[1em] ml-[1px] align-middle"
                      style={{ 
                        background: showCursor ? '#0B0B0D' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    />
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 pt-5 border-t"
              style={{ borderColor: '#E6E7EB' }}
            >
              <p 
                className="text-xs mb-3"
                style={{ color: '#8A8F98' }}
              >
                Start by showing real work.
              </p>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartClick();
                }}
                className="w-full py-3.5 rounded-full text-[15px] font-medium transition-all duration-300"
                style={{
                  background: '#0B0B0D',
                  color: '#FFFFFF',
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 24px -8px rgba(11, 11, 13, 0.35)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Start Now →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
