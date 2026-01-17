import { ValidationPlan } from '@/types/brief';
import { motion } from 'framer-motion';

interface ValidationPlanSectionProps {
  plan: ValidationPlan;
}

export function ValidationPlanSection({ plan }: ValidationPlanSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.2 }}
      className="mb-16"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
        Fastest Way to Validate the Biggest Risk
      </h2>

      <div className="space-y-8">
        {/* Risk to validate */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            To validate:
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {plan.riskToValidate}
          </p>
        </div>

        {/* The question */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Ask this in a 15–30 min conversation:
          </p>
          <blockquote className="text-foreground leading-relaxed pl-4 border-l-2 border-muted">
            "{plan.question}"
          </blockquote>
        </div>

        {/* Strong answer */}
        {plan.strongAnswer && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              What a strong answer sounds like:
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {plan.strongAnswer}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}