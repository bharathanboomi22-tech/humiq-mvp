import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { AISignalOrb } from './AISignalOrb';

const identityPatterns = [
  { label: 'Systems Thinker', delay: 0 },
  { label: 'Constraint Navigator', delay: 0.6 },
  { label: 'Pragmatic Builder', delay: 1.2 },
  { label: 'Detail Oriented', delay: 1.8 },
];

export function WorkIdentityPhase() {
  const shouldReduceMotion = useReducedMotion();
  const phaseRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(phaseRef, { once: true, margin: '-50px' });
  const [visiblePatterns, setVisiblePatterns] = useState<number[]>([]);
  const [orbState, setOrbState] = useState<'idle' | 'thinking' | 'complete'>('idle');

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) {
        setVisiblePatterns([0, 1, 2, 3]);
        setOrbState('complete');
      }
      return;
    }

    setOrbState('thinking');
    
    identityPatterns.forEach((pattern, index) => {
      setTimeout(() => {
        setVisiblePatterns(prev => [...prev, index]);
        if (index === identityPatterns.length - 1) {
          setTimeout(() => setOrbState('complete'), 400);
        }
      }, pattern.delay * 1000 + 600);
    });
  }, [isInView, shouldReduceMotion]);

  return (
    <div ref={phaseRef}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Mobile: AI Signals First */}
        <div className="lg:hidden order-1">
          <IdentityVisual 
            visiblePatterns={visiblePatterns}
            orbState={orbState}
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
        </div>

        {/* Left Copy - 5 columns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.1 }}
          className="lg:col-span-5 order-2 lg:order-1"
        >
          <h3 className="text-2xl md:text-[28px] font-bold text-foreground mb-4 font-display">
            See how you work — clearly
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-base leading-relaxed">
              From real signals and real decisions, HumiQ forms a Work Identity.
            </p>
            <p className="text-base leading-relaxed">
              Not a profile. Not a score.
            </p>
            <p className="text-base leading-relaxed">
              A clear picture of how you approach problems.
            </p>
          </div>
          {/* Value line */}
          <p className="mt-6 text-sm font-medium text-foreground/70">
            Even without a job match, this insight is yours.
          </p>
        </motion.div>

        {/* Spacer - 1 column */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Right AI Signals - 6 columns (Desktop) */}
        <div className="hidden lg:block lg:col-span-6 order-3">
          <IdentityVisual 
            visiblePatterns={visiblePatterns}
            orbState={orbState}
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
        </div>
      </div>
    </div>
  );
}

interface IdentityVisualProps {
  visiblePatterns: number[];
  orbState: 'idle' | 'thinking' | 'complete';
  shouldReduceMotion: boolean | null;
  isInView: boolean;
}

function IdentityVisual({ visiblePatterns, orbState, shouldReduceMotion, isInView }: IdentityVisualProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="relative"
    >
      {/* Glass Container */}
      <div 
        className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Ambient gradient behind */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 70%, rgba(255, 143, 177, 0.1) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* AI Orb - Center Top */}
          <div className="mb-6">
            <AISignalOrb state={orbState} size={40} />
          </div>

          {/* Work Identity Title */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6"
          >
            Work Identity Forming
          </motion.p>

          {/* Pattern Tags */}
          <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
            {identityPatterns.map((pattern, index) => {
              const isVisible = visiblePatterns.includes(index);
              
              return (
                <motion.div
                  key={pattern.label}
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={isVisible || shouldReduceMotion ? { 
                    opacity: 1, 
                    scale: 1, 
                    y: 0 
                  } : {}}
                  transition={{ 
                    duration: 0.5, 
                    ease: 'easeOut',
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: isVisible 
                      ? 'linear-gradient(135deg, rgba(91, 140, 255, 0.1) 0%, rgba(185, 131, 255, 0.08) 100%)'
                      : 'rgba(0, 0, 0, 0.03)',
                    border: isVisible 
                      ? '1px solid rgba(91, 140, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                    color: isVisible ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {pattern.label}
                </motion.div>
              );
            })}
          </div>

          {/* Completion message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={orbState === 'complete' ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="mt-6 text-xs text-muted-foreground text-center"
          >
            Understanding emerges over time.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
