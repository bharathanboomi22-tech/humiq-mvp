import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { AIOrbi } from '@/components/hero/AIOrbi';

interface DualStageCardProps {
  title: string;
  contentText: string;
  visualType: 'work-signals' | 'ai-chat' | 'work-identity' | 'intent-map' | 'shortlist' | 'evidence-panel';
  autoSwitchDelay?: number;
}

// Work Signals Visual (Talent Step 1) - HIGH CONTRAST gradient chips
function WorkSignalsVisual() {
  const shouldReduceMotion = useReducedMotion();
  const signals = ['AI Walkthrough', 'Code/Repo', 'Design/Prototype', 'Docs/Writing'];
  
  return (
    <div className="flex flex-wrap gap-3 justify-center items-center h-full p-6">
      {signals.map((signal, i) => (
        <motion.div
          key={signal}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%)',
            boxShadow: '0 4px 12px rgba(255, 47, 178, 0.3)',
          }}
        >
          {signal}
        </motion.div>
      ))}
    </div>
  );
}

// AI Chat Visual (Talent Step 2) - HIGH CONTRAST with Orbi
function AIChatVisual() {
  const shouldReduceMotion = useReducedMotion();
  const messages = [
    "Tell me about a decision you made...",
    "What constraints did you consider?",
    "How did you validate your approach?",
  ];
  
  return (
    <div className="flex flex-col gap-3 p-5 h-full justify-center">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.3, duration: 0.4 }}
          className="flex items-start gap-3"
        >
          <div className="flex-shrink-0 mt-0.5">
            <AIOrbi size="sm" isWriting={i === messages.length - 1} />
          </div>
          <div 
            className="px-4 py-2.5 rounded-2xl text-sm text-white font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(255, 47, 178, 0.3) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {msg}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Work Identity Visual (Talent Step 3) - HIGH CONTRAST chips
function WorkIdentityVisual() {
  const shouldReduceMotion = useReducedMotion();
  const chips = [
    { label: 'Strength', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { label: 'Risk', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { label: 'Pattern', gradient: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%)' },
  ];
  
  return (
    <div className="flex flex-col gap-4 p-6 h-full justify-center">
      <div className="flex gap-3 justify-center flex-wrap">
        {chips.map((chip, i) => (
          <motion.div
            key={chip.label}
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{
              background: chip.gradient,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {chip.label}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-center text-sm text-white font-medium"
      >
        Strong systems thinking, early in scaling experience
      </motion.p>
    </div>
  );
}

// Intent Map Visual (Company Step 1) - HIGH CONTRAST
function IntentMapVisual() {
  const shouldReduceMotion = useReducedMotion();
  const chips = ['Outcome', 'Constraints', 'Ownership', 'Collaboration'];
  
  return (
    <div className="flex flex-wrap gap-3 justify-center items-center h-full p-6">
      {chips.map((chip, i) => (
        <motion.div
          key={chip}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.3 }}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%)',
            boxShadow: '0 4px 12px rgba(255, 47, 178, 0.3)',
          }}
        >
          {chip}
        </motion.div>
      ))}
    </div>
  );
}

// Shortlist Visual (Company Step 2) - BOLD avatars
function ShortlistVisual() {
  const shouldReduceMotion = useReducedMotion();
  const candidates = ['JM', 'AR', 'SK'];
  
  return (
    <div className="flex gap-4 justify-center items-center h-full p-6">
      {candidates.map((initials, i) => (
        <motion.div
          key={initials}
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%)',
            boxShadow: '0 6px 20px rgba(255, 47, 178, 0.4)',
          }}
        >
          {initials}
        </motion.div>
      ))}
    </div>
  );
}

// Evidence Panel Visual (Company Step 3) - HIGH CONTRAST
function EvidencePanelVisual() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="flex flex-col gap-4 p-6 h-full justify-center">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div 
          className="w-16 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%)',
          }}
        >
          <span className="text-white text-lg">▶</span>
        </div>
        <span className="text-sm text-white font-medium">Interview excerpt</span>
      </motion.div>
      <motion.p
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm text-white italic font-medium"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(255, 47, 178, 0.2) 100%)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        "I prioritized speed because..."
      </motion.p>
    </div>
  );
}

const visualComponents = {
  'work-signals': WorkSignalsVisual,
  'ai-chat': AIChatVisual,
  'work-identity': WorkIdentityVisual,
  'intent-map': IntentMapVisual,
  'shortlist': ShortlistVisual,
  'evidence-panel': EvidencePanelVisual,
};

export function DualStageCard({ 
  title, 
  contentText, 
  visualType,
  autoSwitchDelay = 2500,
}: DualStageCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState<'content' | 'visual'>('content');
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, margin: '-100px' });
  const hasAutoSwitched = useRef(false);

  // Auto-switch from content to visual when in view
  useEffect(() => {
    if (isInView && !hasAutoSwitched.current && activeStage === 'content') {
      const timer = setTimeout(() => {
        setActiveStage('visual');
        hasAutoSwitched.current = true;
      }, autoSwitchDelay);
      return () => clearTimeout(timer);
    }
  }, [isInView, activeStage, autoSwitchDelay]);

  // Reset when leaving view
  useEffect(() => {
    if (!isInView) {
      hasAutoSwitched.current = false;
      setActiveStage('content');
    }
  }, [isInView]);

  const VisualComponent = visualComponents[visualType];

  return (
    <motion.div
      ref={cardRef}
      className="flex flex-col"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title - WHITE text */}
      <h3 className="text-base font-bold text-[#111111] mb-4 font-display">
        {title}
      </h3>
      
      {/* Dark Card with dual stages */}
      <div className="relative flex-1 rounded-[28px] bg-[#0B0B10] min-h-[320px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <AnimatePresence mode="wait">
          {activeStage === 'content' ? (
            <motion.div
              key="content"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              {/* ALL TEXT PURE WHITE */}
              <p className="text-[15px] text-white text-center leading-relaxed">
                {contentText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="visual"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <VisualComponent />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={() => setActiveStage('content')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStage === 'content' 
                ? 'bg-pink-hot shadow-[0_0_8px_rgba(255,47,178,0.6)]' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label="Show content"
          />
          <button
            onClick={() => setActiveStage('visual')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStage === 'visual' 
                ? 'bg-pink-hot shadow-[0_0_8px_rgba(255,47,178,0.6)]' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label="Show visual"
          />
        </div>
      </div>
    </motion.div>
  );
}
