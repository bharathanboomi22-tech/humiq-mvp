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
    <section className="mb-16">
      <h2 className="section-header">
        What This Evidence Suggests
      </h2>

      <div className="glass-card p-6 space-y-6">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.08, ease: 'easeOut' }}
            className={index < signals.length - 1 ? "pb-6 border-b border-border" : ""}
          >
            {/* Signal name and level */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[15px] text-foreground font-medium">
                {signal.name}
              </span>
              <span className={`signal-${signal.level} text-xs font-medium`}>
                {levelLabels[signal.level]}
              </span>
            </div>
            
            {/* Evidence */}
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[65ch]">
              {signal.evidence}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
