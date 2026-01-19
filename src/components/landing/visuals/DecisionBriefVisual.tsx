import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Search } from 'lucide-react';

const briefRows = [
  { icon: CheckCircle, label: 'Recommendation', color: 'rgba(51, 214, 166, 0.8)' },
  { icon: AlertTriangle, label: 'Risks & Unknowns', color: 'rgba(246, 193, 119, 0.8)' },
  { icon: Search, label: 'What to validate next', color: 'rgba(255,255,255,0.7)' },
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
        duration: shouldReduceMotion ? 0 : 0.4, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-[20px] backdrop-blur-[12px]"
      style={{ 
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0px 40px 80px rgba(0,0,0,0.45)'
      }}
    >
      {/* Card Header */}
      <p 
        className="text-[11px] tracking-[0.12em] uppercase text-center mb-5"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
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
              duration: shouldReduceMotion ? 0 : 0.3, 
              delay: shouldReduceMotion ? 0 : 0.12 * (index + 1),
              ease: 'easeOut' 
            }}
            className="flex items-center gap-4 p-4 rounded-[12px]"
            style={{ 
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <row.icon 
              className="w-5 h-5 flex-shrink-0"
              style={{ color: row.color }}
            />
            <span 
              className="text-[14px]"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {row.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Status Line */}
      <p 
        className="text-sm text-center mt-5"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        Decision-ready. No raw data.
      </p>
    </motion.div>
  );
}
