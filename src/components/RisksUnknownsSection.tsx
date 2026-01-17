import { RiskUnknown } from '@/types/brief';
import { motion } from 'framer-motion';

interface RisksUnknownsSectionProps {
  risks: RiskUnknown[];
}

export function RisksUnknownsSection({ risks }: RisksUnknownsSectionProps) {
  if (!risks || risks.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className="mb-16"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
        Key Risks & Unknowns
      </h2>

      <ul className="space-y-4">
        {risks.slice(0, 3).map((risk, index) => (
          <motion.li
            key={risk.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, delay: 0.17 + index * 0.03 }}
            className="flex items-start gap-4"
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
            <p className="text-sm text-foreground/75 leading-relaxed">
              {risk.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}