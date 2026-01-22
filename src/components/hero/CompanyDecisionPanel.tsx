import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';

interface CandidateCard {
  id: number;
  initials: string;
  thinkingPattern: string;
  decisionBehavior: string;
  aiInsight: string;
  isReady: boolean;
}

const candidates: CandidateCard[] = [
  {
    id: 1,
    initials: 'JM',
    thinkingPattern: 'Systems-first',
    decisionBehavior: 'Data-driven, iterative',
    aiInsight: 'Strong under ambiguity',
    isReady: true,
  },
  {
    id: 2,
    initials: 'AR',
    thinkingPattern: 'User-centered',
    decisionBehavior: 'Rapid prototyping',
    aiInsight: 'Excellent collaboration signals',
    isReady: false,
  },
  {
    id: 3,
    initials: 'SK',
    thinkingPattern: 'First-principles',
    decisionBehavior: 'Calculated risk-taker',
    aiInsight: 'Deep ownership patterns',
    isReady: false,
  },
];

export function CompanyDecisionPanel() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCard, setActiveCard] = useState(0);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const cycleInterval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % candidates.length);
      setShowInsight(false);
    }, 4000);

    const insightDelay = setTimeout(() => {
      setShowInsight(true);
    }, 1500);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(insightDelay);
    };
  }, [activeCard, shouldReduceMotion]);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative"
    >
      {/* Glass Container */}
      <div
        className="relative rounded-3xl p-6 md:p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* AI Orb indicator */}
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF 0%, #B983FF 50%, #FF8FB1 100%)',
              }}
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm font-medium" style={{ color: '#5F6368' }}>
              AI Decision Panel
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(91, 140, 255, 0.1)', color: '#5B8CFF' }}>
            Live
          </span>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.5, duration: 0.5 }}
              className="relative rounded-xl p-4 transition-all duration-300"
              style={{
                background: activeCard === index 
                  ? 'rgba(91, 140, 255, 0.06)' 
                  : 'rgba(255, 255, 255, 0.5)',
                border: activeCard === index 
                  ? '1px solid rgba(91, 140, 255, 0.2)' 
                  : '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    background: candidate.isReady 
                      ? 'linear-gradient(135deg, #5B8CFF 0%, #B983FF 100%)' 
                      : 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
                    color: candidate.isReady ? '#FFFFFF' : '#6B7280',
                  }}
                >
                  {candidate.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium" style={{ color: '#0B0B0D' }}>
                      {candidate.thinkingPattern}
                    </span>
                    {candidate.isReady && (
                      <motion.span
                        initial={shouldReduceMotion ? {} : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.15) 0%, rgba(185, 131, 255, 0.15) 100%)',
                          color: '#5B8CFF',
                        }}
                      >
                        <Check className="w-3 h-3" />
                        Decision-Ready
                      </motion.span>
                    )}
                  </div>
                  
                  <p className="text-xs mb-2" style={{ color: '#5F6368' }}>
                    {candidate.decisionBehavior}
                  </p>

                  {/* AI Insight - animated */}
                  <AnimatePresence mode="wait">
                    {(activeCard === index && showInsight) && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3" style={{ color: '#B983FF' }} />
                        <span className="text-xs font-medium" style={{ color: '#8B5CF6' }}>
                          {candidate.aiInsight}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active indicator line */}
              {activeCard === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #5B8CFF 0%, #B983FF 100%)',
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer insight */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-5 pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: '#10B981' }}
            />
            <span className="text-xs" style={{ color: '#5F6368' }}>
              3 candidates analyzed
            </span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#5B8CFF' }}>
            1 decision-ready
          </span>
        </motion.div>
      </div>

      {/* Ambient glow behind panel */}
      <div
        className="absolute -inset-4 -z-10 opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(91, 140, 255, 0.15) 0%, rgba(185, 131, 255, 0.1) 40%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}
