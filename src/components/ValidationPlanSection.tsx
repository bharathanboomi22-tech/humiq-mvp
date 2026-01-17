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
      transition={{ duration: 0.16, delay: 0.2, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <h2 className="font-display text-xl font-medium text-foreground mb-1">
        Fastest Way to Validate the Biggest Risk
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Clarity → Action
      </p>

      <div className="p-5 rounded-lg bg-card border border-border">
        {/* Risk to validate */}
        <p className="text-sm text-muted-foreground mb-4">
          To validate <span className="text-foreground font-medium">{plan.riskToValidate}</span>, ask this in a 15–30 min conversation:
        </p>

        {/* Question */}
        <blockquote className="text-base text-foreground leading-relaxed pl-4 border-l-2 border-accent mb-6">
          "{plan.question}"
        </blockquote>

        {/* Answer guidance */}
        {(plan.strongAnswer || plan.weakAnswer) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {plan.strongAnswer && (
              <div>
                <p className="text-xs uppercase tracking-wider text-signal-high mb-2">
                  Strong answer sounds like
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.strongAnswer}
                </p>
              </div>
            )}
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
