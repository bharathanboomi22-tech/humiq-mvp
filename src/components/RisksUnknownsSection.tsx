import { RiskUnknown } from '@/types/brief';
import { motion } from 'framer-motion';

interface RisksUnknownsSectionProps {
  risks: RiskUnknown[];
}

export function RisksUnknownsSection({ risks }: RisksUnknownsSectionProps) {
  if (!risks || risks.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="section-header">
        Key Risks & Unknowns
      </h2>

      <ul className="space-y-4">
        {risks.slice(0, 3).map((risk, index) => (
          <motion.li
            key={risk.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.08, ease: 'easeOut' }}
            className="flex items-start gap-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2.5 flex-shrink-0" />
            <p className="text-[15px] text-foreground/85 leading-relaxed max-w-[65ch]">
              {risk.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
