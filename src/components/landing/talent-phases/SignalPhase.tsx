import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView, AnimatePresence } from 'framer-motion';
import { Video, Code, FileText, Palette } from 'lucide-react';
import { AISignalOrb } from './AISignalOrb';

const signalTypes = [
  { icon: Code, label: 'Code Sample', delay: 0 },
  { icon: FileText, label: 'Document', delay: 0.8 },
  { icon: Palette, label: 'Design Work', delay: 1.6 },
  { icon: Video, label: 'Walkthrough', delay: 2.4 },
];

export function SignalPhase() {
  const shouldReduceMotion = useReducedMotion();
  const phaseRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(phaseRef, { once: true, margin: '-50px' });
  const [activeSignal, setActiveSignal] = useState(-1);
  const [orbState, setOrbState] = useState<'idle' | 'thinking' | 'processing'>('idle');

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return;

    // Cycle through signals appearing
    const showSignals = () => {
      signalTypes.forEach((signal, index) => {
        setTimeout(() => {
          setOrbState('thinking');
          setTimeout(() => {
            setActiveSignal(index);
            setOrbState('processing');
            setTimeout(() => setOrbState('idle'), 600);
          }, 400);
        }, signal.delay * 1000);
      });
    };

    showSignals();
    const interval = setInterval(() => {
      setActiveSignal(-1);
      setTimeout(showSignals, 500);
    }, 12000);

    return () => clearInterval(interval);
  }, [isInView, shouldReduceMotion]);

  return (
    <div ref={phaseRef} className="mb-20 md:mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Mobile: AI Signals First */}
        <div className="lg:hidden order-1">
          <SignalVisual 
            activeSignal={activeSignal} 
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
            Start with something real
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-base leading-relaxed">
              You don't need a resume, portfolio, or perfect artifact.
            </p>
            <p className="text-base leading-relaxed">
              Share anything that reflects how you work — a project, a doc, a design, or a problem you've solved.
            </p>
            <p className="text-base leading-relaxed">
              If nothing exists yet, HumiQ creates a starting point with you.
            </p>
          </div>
          {/* Reassurance */}
          <div 
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full text-sm text-foreground/70"
            style={{
              background: 'rgba(91, 140, 255, 0.06)',
              border: '1px solid rgba(91, 140, 255, 0.1)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]" />
            No required uploads. No penalties for missing artifacts.
          </div>
        </motion.div>

        {/* Spacer - 1 column */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Right AI Signals - 6 columns (Desktop) */}
        <div className="hidden lg:block lg:col-span-6 order-3">
          <SignalVisual 
            activeSignal={activeSignal} 
            orbState={orbState} 
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
        </div>
      </div>
    </div>
  );
}

interface SignalVisualProps {
  activeSignal: number;
  orbState: 'idle' | 'thinking' | 'processing';
  shouldReduceMotion: boolean | null;
  isInView: boolean;
}

function SignalVisual({ activeSignal, orbState, shouldReduceMotion, isInView }: SignalVisualProps) {
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
            background: 'radial-gradient(ellipse at 30% 50%, rgba(91, 140, 255, 0.1) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* AI Orb - Center */}
          <div className="mb-8">
            <AISignalOrb state={orbState} size={48} />
          </div>

          {/* Signal Nodes Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
            <AnimatePresence>
              {signalTypes.map((signal, index) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: activeSignal >= index || shouldReduceMotion ? 1 : 0.3,
                    scale: activeSignal >= index || shouldReduceMotion ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="relative flex flex-col items-center justify-center p-4 rounded-xl"
                  style={{
                    background: activeSignal >= index 
                      ? 'rgba(91, 140, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${activeSignal >= index ? 'rgba(91, 140, 255, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`,
                  }}
                >
                  {/* Pulse to orb */}
                  {activeSignal === index && !shouldReduceMotion && (
                    <motion.div
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, y: -40, scale: 0.5 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #5B8CFF, #B983FF)',
                        boxShadow: '0 0 8px rgba(91, 140, 255, 0.6)',
                      }}
                    />
                  )}
                  <signal.icon 
                    className="w-5 h-5 mb-2" 
                    style={{ 
                      color: activeSignal >= index ? '#5B8CFF' : 'rgba(0, 0, 0, 0.3)' 
                    }} 
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: activeSignal >= index ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.35)' 
                    }}
                  >
                    {signal.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer message */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Any signal works. Even none.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
