import { CandidateBrief } from '@/types/brief';
import { DecisionPill } from './DecisionPill';
import { motion } from 'framer-motion';

interface BriefHeaderProps {
  brief: CandidateBrief;
}

export function BriefHeader({ brief }: BriefHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center pb-12 border-b border-border"
    >
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Work Evidence Brief
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
        {brief.candidateName}
      </h1>
      <p className="text-muted-foreground mb-6">
        {brief.role}
      </p>
      <DecisionPill decision={brief.decision} />
    </motion.header>
  );
}
