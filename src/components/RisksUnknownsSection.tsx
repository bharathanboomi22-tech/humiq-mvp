import { RiskUnknown } from '@/types/brief';
import { motion } from 'framer-motion';

interface RisksUnknownsSectionProps {
  risks: RiskUnknown[];
}

export function RisksUnknownsSection({ risks }: RisksUnknownsSectionProps) {
  // Don't render if no risks
  if (!risks || risks.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.12, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-1">
        Key Risks & Unknowns
      </h2>
      <p className="text-xs text-muted-foreground mb-8">
        Honest gaps increase trust
      </p>

      <ul className="space-y-4">
        {risks.slice(0, 3).map((risk, index) => (
          <motion.li
            key={risk.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.14 + index * 0.025, ease: 'easeOut' }}
            className="flex items-start gap-3"
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2.5 flex-shrink-0" />
            <p className="text-sm text-foreground/75 leading-relaxed">
              {risk.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}