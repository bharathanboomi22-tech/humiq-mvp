import { InterviewBlock } from '@/types/brief';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface InterviewPlanSectionProps {
  plan: InterviewBlock[];
}

export function InterviewPlanSection({ plan }: InterviewPlanSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
        30-Min Interview Plan
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Structured to reduce your thinking effort
      </p>

      <div className="space-y-8">
        {plan.map((block, index) => (
          <motion.div
            key={block.timeRange}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 + index * 0.08, ease: 'easeOut' }}
            className="relative pl-6 border-l-2 border-border"
          >
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-foreground/30" />
            
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {block.timeRange}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {block.objective}
            </p>

            <div className="space-y-3">
              {block.prompts.map((prompt, promptIndex) => (
                <div
                  key={promptIndex}
                  className="p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{prompt}"
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
