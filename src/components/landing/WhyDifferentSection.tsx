import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

const otherPlatforms = [
  'Resume-based screening',
  'Keyword matching',
  'Manual recruiter filtering',
  'Performative interviews',
  'Humans overloaded early',
  'Weak, noisy signals',
];

const humiqFeatures = [
  'Work-based signal',
  'AI-led first interview',
  'Autonomous decision flow',
  'Behavior under constraint',
  'Humans involved later',
  'Decision-ready output',
];

export function WhyDifferentSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative bg-background"
    >
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-16 md:mb-20 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            Why HumIQ is different
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Most platforms optimize hiring. HumIQ removes noise from it.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Other Platforms Column */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-sm uppercase tracking-wider text-muted-foreground/60 mb-6 font-medium"
              >
                Other platforms
              </motion.div>
              <div className="space-y-4">
                {otherPlatforms.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : index * 0.1,
                      ease: 'easeOut',
                    }}
                    className="text-base text-muted-foreground/70"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* HumIQ Column */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-sm uppercase tracking-wider text-foreground mb-6 font-medium"
              >
                HumIQ
              </motion.div>
              <div className="space-y-4">
                {humiqFeatures.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : index * 0.15,
                      ease: 'easeOut',
                    }}
                    className="text-base text-foreground font-medium"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Closing Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.8,
            ease: 'easeOut',
          }}
          className="mt-20 md:mt-28 text-center"
        >
          <p className="font-display text-lg md:text-xl text-foreground leading-relaxed max-w-lg mx-auto font-medium">
            Hiring doesn't fail from lack of data.
            <br />
            It fails from lack of signal.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
