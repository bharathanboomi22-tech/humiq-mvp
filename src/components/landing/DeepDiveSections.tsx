import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

interface DeepDiveSection {
  title: string;
  body: string[];
  trustCue: string;
}

const sections: DeepDiveSection[] = [
  {
    title: 'Talent shares how they work',
    body: [
      'Talent can share real work evidence — code, products, designs, writing, or past projects.',
      'If nothing exists, HumIQ adapts automatically.',
      'No resume formatting. No keyword optimization.',
      'Signal comes from how someone works, not how they present.',
    ],
    trustCue: 'No required uploads. No penalties for missing artifacts.',
  },
  {
    title: 'The first interview happens automatically',
    body: [
      "When there's a relevant opportunity, HumIQ sends an AI-led interview invite directly to the candidate's inbox.",
      'No recruiter review. No scheduling loops.',
      'Every candidate starts from the same place.',
    ],
    trustCue: 'Access is consistent. Bias is reduced.',
  },
  {
    title: 'A real work conversation — not a test',
    body: [
      'HumIQ conducts an adaptive AI-led video interview.',
      'It explores how someone reasons under constraints, handles tradeoffs, and explains decisions.',
      'This replaces screening calls and first-round interviews — without scripts or trick questions.',
    ],
    trustCue: 'Not a quiz. Not a challenge. No memorization.',
  },
  {
    title: 'Companies receive a hiring decision',
    body: [
      'HumIQ sends a decision-ready summary — not raw data.',
      'Each report includes:',
      '• A clear recommendation',
      '• Why it exists',
      '• Explicit risks and unknowns',
      '• What to validate next',
      'No scores. No dashboards.',
    ],
    trustCue: 'If the signal is weak, HumIQ says so.',
  },
  {
    title: 'Humans step in only when it matters',
    body: [
      'When the signal is strong, the company sends a direct interview invite with the hiring manager.',
      'Human judgment stays where it belongs — at the final decision.',
    ],
    trustCue: 'AI stops before humans matter most.',
  },
];

function DeepDiveCard({ section, index }: { section: DeepDiveSection; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="py-16 md:py-24"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        className="container mx-auto px-6 lg:px-12"
      >
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:direction-rtl'}`}>
          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              ease: 'easeOut',
            }}
            className={isEven ? '' : 'lg:order-2 lg:text-left'}
            style={{ direction: 'ltr' }}
          >
            <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-6">
              {section.title}
            </h3>
            
            <div className="space-y-4 mb-8">
              {section.body.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-base text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Trust cue */}
            <div
              className="inline-block px-4 py-2 rounded-lg text-sm"
              style={{
                background: 'rgba(51, 214, 166, 0.08)',
                color: 'hsl(162 63% 52%)',
                border: '1px solid rgba(51, 214, 166, 0.15)',
              }}
            >
              {section.trustCue}
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.15,
              ease: 'easeOut',
            }}
            className={isEven ? '' : 'lg:order-1'}
            style={{ direction: 'ltr' }}
          >
            {/* Abstract UI frame */}
            <div
              className="aspect-[4/3] rounded-2xl relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Mock UI elements */}
              <div className="absolute inset-6 flex flex-col gap-4">
                {/* Header bar */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-2 w-24 rounded"
                      style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                    />
                    <div
                      className="h-1.5 w-16 rounded"
                      style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                    />
                  </div>
                </div>

                {/* Content lines */}
                <div className="flex-1 space-y-3 pt-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        width: `${85 - i * 15}%`,
                      }}
                    />
                  ))}
                </div>

                {/* Bottom action */}
                <div className="flex gap-3">
                  <div
                    className="h-8 w-20 rounded-lg"
                    style={{ background: 'rgba(124, 92, 255, 0.15)' }}
                  />
                  <div
                    className="h-8 w-16 rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                </div>
              </div>

              {/* Subtle glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 60% at ${isEven ? '30% 70%' : '70% 70%'}, rgba(124, 92, 255, 0.06), transparent)`,
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function DeepDiveSections() {
  return (
    <section className="relative" style={{ background: '#0A0D12' }}>
      {/* Section divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
      />

      {sections.map((section, index) => (
        <DeepDiveCard key={index} section={section} index={index} />
      ))}
    </section>
  );
}
