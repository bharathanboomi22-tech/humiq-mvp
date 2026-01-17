import { FounderRecommendation } from '@/types/brief';
import { motion } from 'framer-motion';

interface FounderRecommendationSectionProps {
  recommendation: FounderRecommendation;
}

export function FounderRecommendationSection({ recommendation }: FounderRecommendationSectionProps) {
  // Don't render if no reasons
  if (!recommendation.reasons || recommendation.reasons.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.2, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-6">
        Final Recommendation
      </h2>

      {/* Plain-language recommendation */}
      <div className="space-y-3 mb-8">
        {recommendation.reasons.slice(0, 2).map((reason, index) => (
          <p key={index} className="text-sm text-foreground/80 leading-relaxed">
            {reason}
          </p>
        ))}
      </div>

      {/* Optional secondary CTAs */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:border-accent/50 hover:text-foreground transition-all duration-100">
          Draft outreach message
        </button>
        <button className="px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:border-accent/50 hover:text-foreground transition-all duration-100">
          Save brief
        </button>
      </div>
    </motion.section>
  );
}
