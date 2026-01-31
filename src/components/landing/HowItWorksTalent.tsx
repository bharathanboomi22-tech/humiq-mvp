import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { DualStageCard } from './DualStageCard';

const talentSteps = [
  {
    title: 'Start with real work.',
    contentText: 'Share proof of your work — code, designs, documents, products, or writing. Anything that shows how you actually create.',
    visualType: 'work-signals' as const,
  },
  {
    title: 'Reveal your thinking process.',
    contentText: 'Through structured questions, reveal how you make decisions, handle trade-offs, and solve problems under constraints.',
    visualType: 'ai-chat' as const,
  },
  {
    title: 'See how you really work.',
    contentText: 'Your Work Identity emerges from real evidence — strengths, growth areas, and working style — not self-reported claims.',
    visualType: 'work-identity' as const,
  },
];

export function HowItWorksTalent() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full py-24 md:py-32 overflow-hidden bg-background"
    >
      {/* Atmospheric gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.1) 0%, transparent 60%)',
        }}
      />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-tight mb-4 font-display text-foreground">
            How HumiQ looks beyond CVs
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            A new way to be evaluated through real work, not polished CVs.
          </p>
        </motion.div>

        {/* Steps Grid with Dual-Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {talentSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
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
      </div>
    </section>
  );
}
