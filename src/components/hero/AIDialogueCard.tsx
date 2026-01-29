import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

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
const CHAR_DELAY = 35;
const LINE_PAUSE = 150;
const MESSAGE_PAUSE = 600;
const INITIAL_DELAY = 800;

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

  const handleSkip = useCallback(() => {
    if (!skipped && !showCTA) {
      setSkipped(true);
      setCompletedMessages(MESSAGES.map(m => m.id));
      setCurrentMessageIndex(MESSAGES.length);
      setShowCTA(true);
      setShowCursor(false);
    }
  }, [skipped, showCTA]);

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

  useEffect(() => {
    if (shouldReduceMotion || skipped) {
      setCompletedMessages(MESSAGES.map(m => m.id));
      setShowCTA(true);
      setShowCursor(false);
      return;
    }

    if (currentMessageIndex >= MESSAGES.length && completedMessages.length === MESSAGES.length) {
      if (!showCTA) {
        setShowCTA(true);
        setShowCursor(false);
      }
      return;
    }

    const currentMessage = MESSAGES[currentMessageIndex];
    const currentLine = currentMessage?.lines[currentLineIndex];

    if (currentMessageIndex === 0 && currentLineIndex === 0 && currentCharIndex === 0 && !isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(true);
      }, INITIAL_DELAY);
      return () => clearTimeout(timeout);
    }

    if (!isTyping || !currentLine) return;

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(timeout);
    } else if (currentLineIndex < currentMessage.lines.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, LINE_PAUSE);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCompletedMessages(prev => [...prev, currentMessage.id]);
        if (currentMessageIndex < MESSAGES.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentLineIndex(0);
          setCurrentCharIndex(0);
        } else {
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

  return (
    <motion.div
      onClick={handleSkip}
      className="relative w-full max-w-[420px] mx-auto cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Dark Card */}
      <div className="relative rounded-[20px] p-6 md:p-7 bg-[#0B0B0D] text-white">
        {/* Header */}
        <div className="mb-6">
          <p className="text-base font-semibold text-white">HumiQ</p>
          <p className="text-sm text-gray-400">Super Career Intelligence</p>
        </div>

        {/* Messages */}
        <div className="space-y-3 min-h-[180px]">
          {MESSAGES.map((message) => {
            const displayText = getDisplayText(message);
            const isCurrentMessage = MESSAGES[currentMessageIndex]?.id === message.id;
            const isCompleted = completedMessages.includes(message.id);
            const shouldShow = isCompleted || (isCurrentMessage && isTyping) || skipped;

            if (!shouldShow) return null;

            return (
              <motion.p
                key={message.id}
                className="text-[15px] leading-relaxed text-gray-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {displayText}
                {MESSAGES[currentMessageIndex]?.id === message.id && 
                 !completedMessages.includes(message.id) && (
                  <span 
                    className="inline-block w-[2px] h-[1em] ml-[1px] align-middle"
                    style={{ 
                      background: showCursor ? '#FFFFFF' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  />
                )}
              </motion.p>
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
              className="mt-6"
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartClick();
                }}
                className="px-6 py-3 rounded-full text-[15px] font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #E91E8C 0%, #C71585 100%)',
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 24px -8px rgba(233, 30, 140, 0.5)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Start Now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}