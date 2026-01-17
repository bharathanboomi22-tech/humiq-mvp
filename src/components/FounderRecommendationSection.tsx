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
  if (!recommendation.reasons || recommendation.reasons.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/90 mb-10">
        Founder Recommendation
      </h2>

      {/* Verdict — decisive but grounded */}
      <p className="text-foreground font-medium text-lg mb-7">
        {verdictLabels[recommendation.verdict]}
      </p>

      {/* Reasons — max 2, readable */}
      <ul className="space-y-4">
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <li key={index} className="flex items-start gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 mt-2.5 flex-shrink-0" />
            <p className="text-[15px] text-foreground/80 leading-relaxed">
              {reason}
            </p>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}