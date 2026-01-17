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
      <h2 className="font-display text-lg font-medium text-foreground mb-1">
        Fast Validation Plan
      </h2>
      <p className="text-xs text-muted-foreground mb-8">
        Clarity → Action
      </p>

      <div className="p-5 rounded-lg bg-card border border-border">
        {/* Biggest risk */}
        <p className="text-sm text-muted-foreground mb-5">
          <span className="text-foreground/80">Biggest risk:</span>{' '}
          {plan.riskToValidate}
        </p>

        {/* Question */}
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Ask this in a 15–30 min conversation
        </p>
        <blockquote className="text-base text-foreground leading-relaxed pl-4 border-l-2 border-accent/50 mb-6">
          "{plan.question}"
        </blockquote>

        {/* Answer guidance */}
        {plan.strongAnswer && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-signal-high mb-2">
                Strong answer sounds like
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {plan.strongAnswer}
              </p>
            </div>
            {plan.weakAnswer && (
              <div>
                <p className="text-xs uppercase tracking-wider text-signal-low mb-2">
                  Weak answer sounds like
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.weakAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}