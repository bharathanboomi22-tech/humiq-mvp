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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.25 }}
      className="mb-16"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
        Founder Recommendation
      </h2>

      {/* Verdict */}
      <p className="text-foreground font-medium mb-6">
        {verdictLabels[recommendation.verdict]}
      </p>

      {/* Reasons — max 2 */}
      <ul className="space-y-3">
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
            <p className="text-sm text-foreground/75 leading-relaxed">
              {reason}
            </p>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}