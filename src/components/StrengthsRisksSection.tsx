import { StrengthItem, RiskItem } from '@/types/brief';
import { motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';

interface StrengthsRisksSectionProps {
  strengths: StrengthItem[];
  risks: RiskItem[];
}

export function StrengthsRisksSection({ strengths, risks }: StrengthsRisksSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
        Strengths vs Role
      </h2>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Strengths Column */}
        <div>
          <h3 className="text-sm uppercase tracking-[0.15em] text-strength font-medium mb-5">
            Observable Strengths
          </h3>
          <ul className="space-y-4">
            {strengths.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.05, ease: 'easeOut' }}
                className="flex items-start gap-3"
              >
                <Check className="w-4 h-4 text-strength flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-sm leading-relaxed">
                  {item.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Risks / Unknowns Column */}
        <div>
          <h3 className="text-sm uppercase tracking-[0.15em] text-risk font-medium mb-5">
            Open Questions
          </h3>
          <ul className="space-y-4">
            {risks.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.05, ease: 'easeOut' }}
                className="flex items-start gap-3"
              >
                <HelpCircle className="w-4 h-4 text-risk flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm leading-relaxed">
                  {item.question}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
