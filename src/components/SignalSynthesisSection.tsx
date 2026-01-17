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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/90 mb-10">
        What This Evidence Suggests
      </h2>

      {/* Each signal gets breathing room — executive summary feel */}
      <div className="space-y-8">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.1 + index * 0.025, ease: [0.25, 0.1, 0.25, 1] }}
            className="py-1"
          >
            {/* Signal name and level — clear hierarchy */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[15px] text-foreground font-medium">
                {signal.name}
              </span>
              <span className={`signal-${signal.level} text-xs font-medium`}>
                {levelLabels[signal.level]}
              </span>
            </div>
            
            {/* Evidence — generous line height */}
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              {signal.evidence}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}