import { ValidationPlan } from '@/types/brief';
import { motion } from 'framer-motion';

interface ValidationPlanSectionProps {
  plan: ValidationPlan;
}



export function ValidationPlanSection({ plan }: ValidationPlanSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="section-header">
        Fastest Way to Validate the Biggest Risk
      </h2>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: easing }}
        className="glass-card p-6 space-y-6"
      >
        {/* Risk to validate */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            To validate:
          </p>
          <p className="text-[15px] text-foreground/90 leading-relaxed max-w-[65ch]">
            {plan.riskToValidate}
          </p>
        </div>

        {/* The question */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Ask this in a 15–30 min conversation:
          </p>
          <blockquote className="text-foreground leading-relaxed pl-5 border-l-2 border-accent/50 py-1 max-w-[65ch]">
            "{plan.question}"
          </blockquote>
        </div>

        {/* Strong answer */}
        {plan.strongAnswer && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              What a strong answer sounds like:
            </p>
            <p className="text-[15px] text-foreground/75 leading-relaxed max-w-[65ch]">
              {plan.strongAnswer}
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
