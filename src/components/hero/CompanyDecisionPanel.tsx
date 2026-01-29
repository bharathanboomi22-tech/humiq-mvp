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
      {/* Dark Card Container */}
      <div className="relative rounded-[20px] p-6 md:p-8 bg-[#0B0B0D] text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* AI Orb indicator */}
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #E91E8C 0%, #FF69B4 50%, #C71585 100%)',
              }}
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm font-medium text-gray-400">
              AI Decision Panel
            </span>
          </div>
          <span 
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(233, 30, 140, 0.15)', color: '#E91E8C' }}
          >
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
                  ? 'rgba(233, 30, 140, 0.08)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: activeCard === index 
                  ? '1px solid rgba(233, 30, 140, 0.25)' 
                  : '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    background: candidate.isReady 
                      ? 'linear-gradient(135deg, #E91E8C 0%, #C71585 100%)' 
                      : 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  {candidate.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-white">
                      {candidate.thinkingPattern}
                    </span>
                    {candidate.isReady && (
                      <motion.span
                        initial={shouldReduceMotion ? {} : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: 'rgba(233, 30, 140, 0.2)',
                          color: '#FF69B4',
                        }}
                      >
                        <Check className="w-3 h-3" />
                        Decision-Ready
                      </motion.span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
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
                        <Sparkles className="w-3 h-3 text-pink-vibrant" />
                        <span className="text-xs font-medium text-pink-light">
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
                    background: 'linear-gradient(180deg, #E91E8C 0%, #FF69B4 100%)',
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
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">
              3 candidates analyzed
            </span>
          </div>
          <span className="text-xs font-medium text-pink-vibrant">
            1 decision-ready
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}