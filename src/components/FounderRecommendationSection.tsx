import { FounderRecommendation, VerdictType } from '@/types/brief';
import { motion } from 'framer-motion';

interface FounderRecommendationSectionProps {
  recommendation: FounderRecommendation;
}

const verdictLabels: Record<VerdictType, string> = {
  interview: 'Interview Now',
  caution: 'Proceed with Caution',
  pass: 'Do Not Advance',
};

export function FounderRecommendationSection({ recommendation }: FounderRecommendationSectionProps) {
  // Don't render if insufficient evidence - validation plan is the main output
  if (!recommendation.reasons || recommendation.reasons.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.2, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-6">
        Founder Recommendation
      </h2>

      <div className="flex items-center gap-3 mb-5">
        <span className={`verdict-${recommendation.verdict} px-4 py-2 rounded-md text-sm font-medium`}>
          {verdictLabels[recommendation.verdict]}
        </span>
      </div>

      <ul className="space-y-3">
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-1 h-1 rounded-full bg-accent mt-2.5 flex-shrink-0" />
            <p className="text-sm text-foreground/75 leading-relaxed">
              {reason}
            </p>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}