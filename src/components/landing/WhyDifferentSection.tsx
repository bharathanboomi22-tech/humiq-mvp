import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

const traditionalPoints = [
  'Resumes and keyword filters',
  'Bulk applications and ATS noise',
  'Manual screening and bias',
  'Optimized for speed, not accuracy',
  'Decisions based on claims',
];

const humiqPoints = [
  'Real work, conversations, and behavior',
  'High-signal insights over volume',
  'Clear visibility into strengths, weaknesses, and risks',
  'Designed for long-term fit, not shortlists',
  'Decisions based on evidence',
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
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
            How HumiQ AI Is Different
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Hiring was designed to filter people.
            <br />
            <span className="font-medium text-foreground">HumiQ AI was designed to understand them.</span>
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Traditional Hiring Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative"
          >
            <div 
              className="rounded-[28px] p-8 bg-white border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] h-full"
            >
              <h3 className="font-display text-lg font-bold text-muted-foreground mb-6">
                Traditional Hiring Platforms
              </h3>
              <div className="space-y-4">
                {traditionalPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : 0.2 + index * 0.08,
                      ease: 'easeOut',
                    }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                    <span className="text-[15px] text-muted-foreground leading-relaxed">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* HumiQ AI Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative"
          >
            {/* Subtle gradient glow on hover */}
            <motion.div 
              className="absolute -inset-2 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 47, 178, 0.08) 0%, transparent 70%)',
              }}
            />
            <div 
              className="relative rounded-[28px] p-8 bg-[#0B0B10] text-white transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.3)] h-full"
            >
              <h3 className="font-display text-lg font-bold text-white mb-6">
                HumiQ AI{' '}
                <span className="text-white/50 font-normal text-sm">(Human Capability Intelligence)</span>
              </h3>
              <div className="space-y-4">
                {humiqPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : 0.3 + index * 0.08,
                      ease: 'easeOut',
                    }}
                    className="flex items-start gap-3"
                  >
                    {/* Gradient dot */}
                    <span 
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #FF2FB2)',
                      }}
                    />
                    <span className="text-[15px] text-white leading-relaxed">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Closing Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.7,
            ease: 'easeOut',
          }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="font-display text-lg md:text-xl text-foreground leading-relaxed max-w-lg mx-auto font-medium">
            The future of hiring isn't about who looks qualified.
            <br />
            <span className="text-gradient">It's about who will actually do the work well.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
