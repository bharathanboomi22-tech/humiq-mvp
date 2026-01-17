import { RiskUnknown } from '@/types/brief';
import { motion } from 'framer-motion';

interface RisksUnknownsSectionProps {
  risks: RiskUnknown[];
}

export function RisksUnknownsSection({ risks }: RisksUnknownsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: 0.15, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <h2 className="font-display text-xl font-medium text-foreground mb-1">
        Key Risks & Unknowns
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Honest gaps increase trust
      </p>

      <ul className="space-y-4">
        {risks.slice(0, 3).map((risk, index) => (
          <motion.li
            key={risk.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, delay: 0.17 + index * 0.03, ease: 'easeOut' }}
            className="flex items-start gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              {risk.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
