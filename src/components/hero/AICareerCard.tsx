import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const messages = [
  "I'm your Personal Career Intelligence.",
  "I learn how you think, decide, solve and work in real life.",
  "I help you get interviews without applying to a single job.",
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
        setTimeout(() => setShowCTA(true), 600);
        return;
      }

      setIsTyping(true);
      
      // Typing duration based on message length
      const typingDuration = Math.min(1200, messages[index].length * 20);
      
      setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(index + 1);
        
        // Pause before next message
        setTimeout(() => showNextMessage(index + 1), 800);
      }, typingDuration);
    };

    // Initial delay before starting
    const timer = setTimeout(() => showNextMessage(0), 1200);
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
      className="relative w-full max-w-[420px] mx-auto cursor-pointer"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
    >
      {/* Card */}
      <div 
        className="relative rounded-[22px] p-6 md:p-8"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 254, 0.92) 100%)',
          boxShadow: `
            0 4px 24px -4px rgba(0, 0, 0, 0.06),
            0 12px 48px -8px rgba(255, 183, 214, 0.15),
            0 0 0 1px rgba(255, 200, 220, 0.12)
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          {/* Animated pulse dot */}
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full bg-foreground"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 w-2 h-2 rounded-full bg-foreground"
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
              HUMIQ AI
            </span>
            <span className="text-[11px] text-muted-foreground">
              Personal Career Intelligence
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 min-h-[140px]">
          <AnimatePresence mode="sync">
            {messages.slice(0, visibleMessages).map((message, index) => (
              <motion.p
                key={index}
                className="text-[15px] md:text-base leading-relaxed text-foreground/90"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {message}
              </motion.p>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && !skipped && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="w-1.5 h-4 bg-foreground/70 rounded-sm"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              className="mt-6 pt-5 border-t border-border/40"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-xs text-muted-foreground mb-3">
                Start by showing real work.
              </p>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                className="w-full py-3 px-6 rounded-full bg-foreground text-background text-sm font-medium transition-all duration-300 hover:opacity-90"
                whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
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
