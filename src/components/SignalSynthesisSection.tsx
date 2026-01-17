import { SignalSynthesis, SignalLevel } from '@/types/brief';
import { motion } from 'framer-motion';

interface SignalSynthesisSectionProps {
  signals: SignalSynthesis[];
}

const levelLabels: Record<SignalLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function SignalSynthesisSection({ signals }: SignalSynthesisSectionProps) {
  // Don't render if no signals
  if (!signals || signals.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.08, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-1">
        What This Evidence Suggests
      </h2>
      <p className="text-xs text-muted-foreground mb-8">
        Interpretation, not raw data
      </p>

      <div className="space-y-5">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.1 + index * 0.025, ease: 'easeOut' }}
            className="grid grid-cols-[140px_1fr] gap-4 items-start"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/80">
                {signal.name.replace(' Signal', '')}
              </span>
              <span className={`signal-${signal.level} text-xs font-medium`}>
                {levelLabels[signal.level]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.evidence}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}