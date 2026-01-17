import { FounderRecommendation, VerdictType } from '@/types/brief';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FounderRecommendationSectionProps {
  recommendation: FounderRecommendation;
}

const verdictLabels: Record<VerdictType, string> = {
  interview: 'Interview Now',
  caution: 'Proceed with Caution',
  pass: 'Do Not Advance',
};

export function FounderRecommendationSection({ recommendation }: FounderRecommendationSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: 0.25, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <h2 className="font-display text-xl font-medium text-foreground mb-6">
        Founder Recommendation
      </h2>

      <div className="flex items-center gap-3 mb-5">
        <ArrowRight className="w-4 h-4 text-accent" />
        <span className={`verdict-${recommendation.verdict} px-4 py-2 rounded-md text-sm font-medium`}>
          {verdictLabels[recommendation.verdict]}
        </span>
      </div>

      <ul className="space-y-3">
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              {reason}
            </p>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
