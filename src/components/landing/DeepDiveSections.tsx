import { useRef, ReactNode } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  WorkSignalsVisual,
  InboxMomentVisual,
  ConversationVisual,
  DecisionBriefVisual,
  FinalHandoffVisual,
} from './visuals';

interface DeepDiveSection {
  title: string;
  body: string[];
  trustCue: string;
  visual: (isInView: boolean) => ReactNode;
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
    visual: (isInView) => <WorkSignalsVisual isInView={isInView} />,
  },
  {
    title: 'The first interview happens automatically',
    body: [
      "When there's a relevant opportunity, HumIQ sends an AI-led interview invite directly to the candidate's inbox.",
      'No recruiter review. No scheduling loops.',
      'Every candidate starts from the same place.',
    ],
    trustCue: 'Access is consistent. Bias is reduced.',
    visual: (isInView) => <InboxMomentVisual isInView={isInView} />,
  },
  {
    title: 'A real work conversation — not a test',
    body: [
      'HumIQ conducts an adaptive AI-led video interview.',
      'It explores how someone reasons under constraints, handles tradeoffs, and explains decisions.',
      'This replaces screening calls and first-round interviews — without scripts or trick questions.',
    ],
    trustCue: 'Not a quiz. Not a challenge. No memorization.',
    visual: (isInView) => <ConversationVisual isInView={isInView} />,
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
    visual: (isInView) => <DecisionBriefVisual isInView={isInView} />,
  },
  {
    title: 'Humans step in only when it matters',
    body: [
      'When the signal is strong, the company sends a direct interview invite with the hiring manager.',
      'Human judgment stays where it belongs — at the final decision.',
    ],
    trustCue: 'AI stops before humans matter most.',
    visual: (isInView) => <FinalHandoffVisual isInView={isInView} />,
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
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
        className="container mx-auto px-6 lg:px-12"
      >
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:direction-rtl'}`}>
          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              ease: 'easeOut',
            }}
            className={isEven ? '' : 'lg:order-2 lg:text-left'}
            style={{ direction: 'ltr' }}
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">
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
            <div className="inline-block px-4 py-2 rounded-full text-sm bg-foreground/5 text-foreground">
              {section.trustCue}
            </div>
          </motion.div>

          {/* Visual Column */}
          <div
            className={`flex justify-center ${isEven ? 'lg:justify-end' : 'lg:justify-start lg:order-1'}`}
            style={{ direction: 'ltr' }}
          >
            {section.visual(isInView)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function DeepDiveSections() {
  return (
    <section className="relative bg-secondary">
      {sections.map((section, index) => (
        <DeepDiveCard key={index} section={section} index={index} />
      ))}
    </section>
  );
}