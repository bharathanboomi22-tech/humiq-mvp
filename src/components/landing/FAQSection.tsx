import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'Do I still need a resume?',
    answer:
      'No. HumiQ AI is built around real work and real thinking. A resume is optional — not required.',
  },
  {
    question: 'How does HumiQ AI understand my real skills?',
    answer:
      'By analyzing how you solve problems, explain decisions, and approach real situations — not by scanning keywords.',
  },
  {
    question: 'Can companies trust AI-driven hiring decisions?',
    answer:
      'Yes. HumiQ AI provides explainable intelligence, not blind scores. Humans make the final decision with clarity and confidence.',
  },
  {
    question: 'Is this fair for fresh graduates or non-traditional backgrounds?',
    answer:
      'Absolutely. HumiQ AI values how you think and learn — not where you studied or worked before.',
  },
  {
    question: 'What happens after I submit my real work?',
    answer:
      'Your capability profile evolves over time. You gain insight. Companies gain clarity. No applications. No noise.',
  },
];

export function FAQSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative bg-background"
    >
      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-3xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            Questions People Ask in a Post-CV World
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : 0.1 + index * 0.08,
                  ease: 'easeOut',
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="rounded-2xl glass-card border-none overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 text-left text-foreground font-semibold text-base hover:no-underline group">
                    <span className="flex-1">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 pt-0">
                    <div className="relative">
                      {/* Gradient accent line */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-teal-400 via-primary to-green-400" />
                      <p className="text-muted-foreground text-[15px] leading-relaxed pt-4">
                        {item.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Closing Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
          }}
          className="mt-16 md:mt-20 text-center relative"
        >
          {/* Subtle glow */}
          <div 
            className="absolute inset-0 -inset-x-8 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
            }}
          />
          <p className="font-display text-lg md:text-xl text-foreground leading-relaxed max-w-md mx-auto font-medium relative">
            The future of hiring isn't about proving yourself.
            <br />
            <span className="text-gradient-teal">It's about being understood.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
