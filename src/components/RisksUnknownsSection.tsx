import { RiskUnknown } from '@/types/brief';
import { motion } from 'framer-motion';

interface RisksUnknownsSectionProps {
  risks: RiskUnknown[];
}

export function RisksUnknownsSection({ risks }: RisksUnknownsSectionProps) {
  if (!risks || risks.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/90 mb-10">
        Key Risks & Unknowns
      </h2>

      {/* Calm tone — honesty, not danger */}
      <ul className="space-y-5">
        {risks.slice(0, 3).map((risk, index) => (
          <motion.li
            key={risk.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.14 + index * 0.025, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-start gap-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 mt-2.5 flex-shrink-0" />
            <p className="text-[15px] text-foreground/80 leading-relaxed">
              {risk.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}