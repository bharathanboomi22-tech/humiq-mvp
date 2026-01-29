import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export function HowItWorksTalent() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    {
      title: 'Start with real work.',
      description: 'Share any project, code, or artifact you\'ve created.',
    },
    {
      title: 'Reveal your thinking process.',
      description: 'Walk through how you solved problems and made decisions.',
    },
    {
      title: 'See how you really work.',
      description: 'Get AI-powered insights into your unique working style.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full py-24 md:py-32 overflow-hidden"
    >
      {/* Pink gradient background at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,230,245,0.3) 30%, rgba(255,182,220,0.4) 60%, rgba(233,30,140,0.15) 100%)',
        }}
      />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold leading-tight text-foreground mb-4 font-display">
            How HumIQ looks beyond CVs
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
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
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              
              {/* Dark Card */}
              <div 
                className="flex-1 rounded-[20px] bg-[#0B0B0D] p-6 min-h-[280px] flex items-center justify-center"
              >
                {/* Placeholder for future visual */}
                <p className="text-gray-600 text-sm text-center">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}