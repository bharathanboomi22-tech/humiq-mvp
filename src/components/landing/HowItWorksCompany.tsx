import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface Step {
  id: 'define' | 'discover' | 'interview' | 'decide';
  headline: string;
  copy: string;
}

const steps: Step[] = [
  {
    id: 'define',
    headline: 'Define role intelligence',
    copy: 'Describe outcomes, decisions, and constraints — not a job description.',
  },
  {
    id: 'discover',
    headline: 'AI discovers aligned talent',
    copy: 'No applications. No screening. Talent surfaces automatically.',
  },
  {
    id: 'interview',
    headline: 'AI runs the first interviews',
    copy: 'Real work, decisions, and trade-offs — before any human time is spent.',
  },
  {
    id: 'decide',
    headline: 'Make a confident decision',
    copy: 'Decision-ready talent insights — not resumes.',
  },
];

export function HowItWorksCompany() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section 
      ref={sectionRef}
      id="how-it-works"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Pink gradient background at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,230,245,0.3) 30%, rgba(255,182,220,0.4) 60%, rgba(255,47,178,0.12) 100%)',
        }}
      />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tight">
            <span className="text-gradient">How hiring works now</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mt-4">
            AI handles the first conversation. You make the final call.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <StepCard 
              key={step.id} 
              step={step} 
              index={index} 
              isInView={isInView} 
            />
          ))}
        </div>

        {/* Closing reinforcement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            No job posts. No CVs. No screening.
            <br />
            <span className="text-foreground font-semibold">
              Just decisions — backed by intelligence.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

interface StepCardProps {
  step: Step;
  index: number;
  isInView: boolean;
}

function StepCard({ step, index, isInView }: StepCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: '-50px' });
  const shouldAnimate = isInView && cardInView;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className="flex flex-col"
    >
      {/* Step Title */}
      <h3 className="text-lg font-bold text-foreground mb-4 font-display">
        {step.headline}
      </h3>
      
      {/* Dark Card */}
      <div className="flex-1 rounded-3xl bg-[#0B0B10] p-6 min-h-[200px] flex items-center justify-center relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 100%, rgba(124, 58, 237, 0.3) 0%, transparent 60%)',
          }}
        />
        <p className="text-gray-400 text-sm text-center relative z-10">
          {step.copy}
        </p>
      </div>
    </motion.div>
  );
}