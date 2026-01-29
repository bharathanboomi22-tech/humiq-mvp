import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export function HowItWorksTalent() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    {
      title: 'Start with real work.',
    },
    {
      title: 'Reveal your thinking process.',
    },
    {
      title: 'See how you really work.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full py-24 md:py-32 overflow-hidden bg-white"
    >
      <div className="container max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-tight mb-4 font-display text-[#111111]">
            How HumiQ looks beyond CVs
          </h2>
          <p className="text-base md:text-lg text-[#111111]/60 max-w-xl mx-auto">
            A new way to be evaluated through real work, not polished CVs.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : 0.1 + index * 0.1,
              }}
              className="flex flex-col"
            >
              {/* Step Title */}
              <h3 className="text-base font-bold text-[#111111] mb-4 font-display">
                {step.title}
              </h3>
              
              {/* Dark Card - Empty placeholder */}
              <div className="flex-1 rounded-[28px] bg-[#0B0B10] min-h-[320px]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
