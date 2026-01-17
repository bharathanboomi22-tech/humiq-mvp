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
  if (!signals || signals.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="mb-16"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
        What This Evidence Suggests
      </h2>

      <div className="space-y-6">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, delay: 0.12 + index * 0.03 }}
          >
            {/* Signal name and level */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-sm text-foreground">
                {signal.name}
              </span>
              <span className={`signal-${signal.level} text-xs`}>
                {levelLabels[signal.level]}
              </span>
            </div>
            
            {/* Evidence */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.evidence}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}