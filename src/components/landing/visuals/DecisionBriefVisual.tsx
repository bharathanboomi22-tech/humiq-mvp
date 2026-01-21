import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Search } from 'lucide-react';

const briefRows = [
  { icon: CheckCircle, label: 'Recommendation', color: 'text-verdict-interview' },
  { icon: AlertTriangle, label: 'Risks & Unknowns', color: 'text-verdict-caution' },
  { icon: Search, label: 'What to validate next', color: 'text-foreground' },
];

interface DecisionBriefVisualProps {
  isInView: boolean;
}

export function DecisionBriefVisual({ isInView }: DecisionBriefVisualProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.5, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-2xl glass-card"
    >
      {/* Card Header */}
      <p className="text-[11px] tracking-[0.12em] uppercase text-center mb-5 text-muted-foreground font-medium">
        DECISION BRIEF
      </p>

      {/* Brief Rows */}
      <div className="space-y-3">
        {briefRows.map((row, index) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ 
              duration: shouldReduceMotion ? 0 : 0.4, 
              delay: shouldReduceMotion ? 0 : 0.12 * (index + 1),
              ease: 'easeOut' 
            }}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary"
          >
            <row.icon className={`w-5 h-5 flex-shrink-0 ${row.color}`} />
            <span className="text-[14px] text-foreground">
              {row.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Status Line */}
      <p className="text-sm text-center mt-5 text-muted-foreground">
        Decision-ready. No raw data.
      </p>
    </motion.div>
  );
}