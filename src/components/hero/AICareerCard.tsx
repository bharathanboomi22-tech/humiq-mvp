import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const messages = [
  "I'm not here to read your CV.",
  "I learn how you think, decide, and solve —\nin real situations.",
  "No keywords. No applications.",
  "Show me something you've worked on.",
  "It doesn't have to be perfect.\nJust real.",
];

export function AICareerCard() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setUserType } = useAuth();
  
  const [visibleMessages, setVisibleMessages] = useState<number>(shouldReduceMotion ? messages.length : 0);
  const [showCTA, setShowCTA] = useState(shouldReduceMotion);
  const [isTyping, setIsTyping] = useState(false);
  const [skipped, setSkipped] = useState(shouldReduceMotion);

  useEffect(() => {
    if (skipped || shouldReduceMotion) return;

    const showNextMessage = (index: number) => {
      if (index >= messages.length) {
        setTimeout(() => setShowCTA(true), 500);
        return;
      }

      setIsTyping(true);
      
      // Typing duration based on message length
      const typingDuration = Math.min(1000, messages[index].length * 18);
      
      setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(index + 1);
        
        // Natural pause between messages
        const pauseDuration = index < 2 ? 600 : 800;
        setTimeout(() => showNextMessage(index + 1), pauseDuration);
      }, typingDuration);
    };

    // Initial delay before starting
    const timer = setTimeout(() => showNextMessage(0), 1500);
    return () => clearTimeout(timer);
  }, [skipped, shouldReduceMotion]);

  const handleSkip = () => {
    if (skipped) return;
    setSkipped(true);
    setVisibleMessages(messages.length);
    setIsTyping(false);
    setShowCTA(true);
  };

  const handleStart = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  return (
    <motion.div
      onClick={handleSkip}
      className="relative w-full max-w-[400px] mx-auto cursor-pointer z-10"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
    >
      {/* Card */}
      <div 
        className="relative rounded-[20px] p-6 md:p-7"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `
            0 4px 32px -8px rgba(0, 0, 0, 0.08),
            0 16px 64px -16px rgba(91, 140, 255, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.8) inset
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          {/* Animated pulse dot */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: '#0B0B0D' }}
              animate={!shouldReduceMotion ? {
                scale: [1, 1.15, 1],
                opacity: [0.9, 1, 0.9],
              } : {}}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {!shouldReduceMotion && (
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{ background: '#0B0B0D' }}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </div>
          
          <div className="flex flex-col">
            <span 
              className="text-xs font-semibold tracking-wide"
              style={{ color: '#0B0B0D' }}
            >
              HumIQ AI
            </span>
            <span 
              className="text-[11px]"
              style={{ color: '#5F6368' }}
            >
              Personal Career Intelligence
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3.5 min-h-[180px]">
          <AnimatePresence mode="sync">
            {messages.slice(0, visibleMessages).map((message, index) => (
              <motion.p
                key={index}
                className="text-[15px] leading-relaxed whitespace-pre-line"
                style={{ color: '#0B0B0D' }}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {message}
              </motion.p>
            ))}
          </AnimatePresence>

          {/* Typing cursor */}
          {isTyping && !skipped && (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="w-[2px] h-[18px] rounded-sm"
                style={{ background: '#0B0B0D' }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                className="w-full py-3.5 px-6 rounded-full text-sm font-medium transition-all duration-300"
                style={{ 
                  background: '#0B0B0D',
                  color: '#FFFFFF',
                }}
                whileHover={shouldReduceMotion ? {} : { 
                  scale: 1.01,
                  boxShadow: '0 8px 24px -8px rgba(11, 11, 13, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Start with real work →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
