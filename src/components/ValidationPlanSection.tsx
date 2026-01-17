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
      transition={{ duration: 0.14, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/90 mb-10">
        Fastest Way to Validate the Biggest Risk
      </h2>

      {/* Slight emphasis — next action, relief */}
      <div className="space-y-10 p-6 bg-card/50 rounded-lg border border-border/50">
        {/* Risk to validate */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            To validate:
          </p>
          <p className="text-[15px] text-foreground/90 leading-relaxed">
            {plan.riskToValidate}
          </p>
        </div>

        {/* The question — clear separation */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Ask this in a 15–30 min conversation:
          </p>
          <blockquote className="text-foreground leading-relaxed pl-5 border-l-2 border-accent/40 py-1">
            "{plan.question}"
          </blockquote>
        </div>

        {/* Strong answer */}
        {plan.strongAnswer && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              What a strong answer sounds like:
            </p>
            <p className="text-[15px] text-foreground/75 leading-relaxed">
              {plan.strongAnswer}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}