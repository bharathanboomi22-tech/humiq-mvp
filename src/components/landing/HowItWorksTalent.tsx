import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { SignalPhase } from './talent-phases/SignalPhase';
import { DecisionsPhase } from './talent-phases/DecisionsPhase';
import { WorkIdentityPhase } from './talent-phases/WorkIdentityPhase';

export function HowItWorksTalent() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 overflow-hidden"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, hsl(220, 100%, 70%) 0%, transparent 60%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, hsl(270, 70%, 70%) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="container max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold leading-tight text-foreground mb-4 font-display">
            How HumIQ understands how you work
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            A different way to be seen — without resumes, applications, or selling yourself.
          </p>
        </motion.div>

        {/* Phase 1 - Signal */}
        <SignalPhase />

        {/* Phase 2 - Decisions */}
        <DecisionsPhase />

        {/* Phase 3 - Work Identity */}
        <WorkIdentityPhase />
      </div>
    </section>
  );
}
