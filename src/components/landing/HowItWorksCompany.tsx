import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { DualStageCard } from './DualStageCard';

const companySteps = [
  {
    title: 'Declare role intent.',
    contentText: 'Define the outcomes, constraints, and ownership expectations — not a traditional job description.',
    visualType: 'intent-map' as const,
  },
  {
    title: 'Invite the right talent.',
    contentText: 'No job boards. Invite candidates based on work signals and evidence of capability.',
    visualType: 'shortlist' as const,
  },
  {
    title: 'Review evidence. Decide.',
    contentText: 'Humans make decisions. AI organizes evidence from real work and conversations.',
    visualType: 'evidence-panel' as const,
  },
];

export function HowItWorksCompany() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section 
      ref={sectionRef}
      id="how-it-works"
      className="py-24 md:py-32 relative overflow-hidden bg-white"
    >
      {/* Pink gradient background at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,230,245,0.3) 40%, rgba(255,182,220,0.3) 70%, rgba(255,107,214,0.15) 100%)',
        }}
      />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-display font-extrabold tracking-tight text-[#111111]">
            How hiring works now
          </h2>
          <p className="text-base md:text-lg text-[#111111]/60 max-w-xl mx-auto mt-4">
            AI handles the first conversation. You make the final call.
          </p>
        </motion.div>

        {/* Steps Grid with Dual-Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {companySteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : 0.1 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DualStageCard
                title={step.title}
                contentText={step.contentText}
                visualType={step.visualType}
                autoSwitchDelay={2500 + index * 300}
              />
            </motion.div>
          ))}
        </div>

        {/* Closing reinforcement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="text-lg md:text-xl text-[#111111]/60 leading-relaxed">
            No job posts. No CVs. No screening.
            <br />
            <span className="text-[#111111] font-semibold">
              Just decisions — backed by intelligence.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
