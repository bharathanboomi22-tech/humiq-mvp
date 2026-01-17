import { DecisionType } from '@/types/brief';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DecisionPillProps {
  decision: DecisionType;
}

const decisionLabels: Record<DecisionType, string> = {
  'hire': 'Hire',
  'needs-signal': 'Needs Signal',
  'pass': 'Pass',
};

export function DecisionPill({ decision }: DecisionPillProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium tracking-wide',
        decision === 'hire' && 'bg-decision-hire-bg text-decision-hire',
        decision === 'needs-signal' && 'bg-decision-signal-bg text-decision-signal',
        decision === 'pass' && 'bg-decision-pass-bg text-decision-pass'
      )}
    >
      {decisionLabels[decision]}
    </motion.span>
  );
}
