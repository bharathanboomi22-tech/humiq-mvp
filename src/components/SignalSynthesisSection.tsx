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
  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: 0.1, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <h2 className="font-display text-xl font-medium text-foreground mb-1">
        What This Evidence Suggests
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Interpretation, not raw data
      </p>

      <div className="space-y-5">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, delay: 0.12 + index * 0.03, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row sm:items-start gap-3"
          >
            <div className="flex items-center gap-3 min-w-[180px]">
              <span className="text-sm font-medium text-foreground">
                {signal.name}
              </span>
              <span className={`signal-${signal.level} text-xs font-medium`}>
                {levelLabels[signal.level]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {signal.evidence}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
