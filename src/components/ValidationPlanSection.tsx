import { ValidationPlan } from '@/types/brief';
import { motion } from 'framer-motion';

interface ValidationPlanSectionProps {
  plan: ValidationPlan;
}

export function ValidationPlanSection({ plan }: ValidationPlanSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.16, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-8">
        Fastest Way to Validate the Biggest Risk
      </h2>

      <div className="space-y-6">
        {/* Biggest risk */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Biggest risk
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {plan.riskToValidate}
          </p>
        </div>

        {/* Question */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Ask this in a 15–30 min conversation
          </p>
          <blockquote className="text-base text-foreground leading-relaxed pl-4 border-l-2 border-accent/50">
            "{plan.question}"
          </blockquote>
        </div>

        {/* Strong answer guidance */}
        {plan.strongAnswer && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              What a strong answer sounds like
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              {plan.strongAnswer}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
