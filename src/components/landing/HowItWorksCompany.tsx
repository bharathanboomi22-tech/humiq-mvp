import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CompanyStepIcon } from './company-steps';

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
      className="section-spacing relative overflow-hidden"
    >
      {/* Subtle gradient wash background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(91, 140, 255, 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(185, 131, 255, 0.05) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 50% 80%, rgba(255, 143, 177, 0.04) 0%, transparent 70%)
          `,
        }}
      />

      <div className="content-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground tracking-tight">
            How hiring works now
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connective flow lines (desktop only) */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              className="h-full origin-left"
              style={{
                background: 'linear-gradient(90deg, transparent 5%, rgba(91, 140, 255, 0.2) 20%, rgba(185, 131, 255, 0.15) 50%, rgba(255, 143, 177, 0.1) 80%, transparent 95%)',
              }}
            />
          </div>

          {/* Steps */}
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
            <span className="text-foreground font-medium">
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
      initial={{ opacity: 0, y: 8 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.12,
        ease: 'easeOut',
      }}
      className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
    >
      {/* Icon */}
      <div className="mb-5">
        <CompanyStepIcon step={step.id} isInView={shouldAnimate} />
      </div>

      {/* Content */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: index * 0.12 + 0.15 }}
        className="text-lg font-display font-semibold text-foreground mb-2"
      >
        {step.headline}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: index * 0.12 + 0.2 }}
        className="text-sm text-muted-foreground leading-relaxed max-w-[280px]"
      >
        {step.copy}
      </motion.p>

      {/* Mobile/Tablet connector dot */}
      {index < steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: index * 0.12 + 0.3 }}
          className="lg:hidden mt-6 w-1.5 h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #5B8CFF, #B983FF)',
          }}
        />
      )}
    </motion.div>
  );
}
