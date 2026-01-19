import { FounderRecommendation, VerdictType } from '@/types/brief';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, LucideIcon } from 'lucide-react';

interface FounderRecommendationSectionProps {
  recommendation: FounderRecommendation;
}

const verdictConfig: Record<string, { label: string; Icon: LucideIcon }> = {
  interview: { label: 'Interview Now', Icon: CheckCircle },
  caution: { label: 'Proceed with Caution', Icon: AlertTriangle },
  pass: { label: 'Fail', Icon: XCircle },
  fail: { label: 'Fail', Icon: XCircle },
};

export function FounderRecommendationSection({ recommendation }: FounderRecommendationSectionProps) {
  if (!recommendation.reasons || recommendation.reasons.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="section-header">
        Founder Recommendation
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {/* Verdict with subtle glow */}
        {(() => {
          const { label, Icon } = verdictConfig[recommendation.verdict];
          return (
            <p className={`verdict-${recommendation.verdict} inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground font-medium text-lg mb-6`}>
              <Icon className="w-5 h-5" />
              {label}
            </p>
          );
        })()}

        {/* Reasons */}
        <ul className="space-y-3">
          {recommendation.reasons.slice(0, 2).map((reason, index) => (
            <li key={index} className="flex items-start gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2.5 flex-shrink-0" />
              <p className="text-[15px] text-foreground/85 leading-relaxed max-w-[65ch]">
                {reason}
              </p>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
