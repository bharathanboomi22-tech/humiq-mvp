import { motion } from 'framer-motion';
import { TalentBrief, TIER_CONFIG, DecisionTier } from './types';
import { TalentBriefCard } from './TalentBriefCard';

interface TalentTierGroupProps {
  tier: DecisionTier;
  talents: TalentBrief[];
  groupIndex: number;
  onInvite: (id: string) => void;
  onSave: (id: string) => void;
  onAskAI: (id: string) => void;
}

export const TalentTierGroup = ({
  tier,
  talents,
  groupIndex,
  onInvite,
  onSave,
  onAskAI,
}: TalentTierGroupProps) => {
  const config = TIER_CONFIG[tier];

  if (talents.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + groupIndex * 0.12 }}
      className="mb-10"
    >
      <header className="mb-4">
        <h2 className="text-sm font-medium text-foreground uppercase tracking-wider">
          {config.label}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
      </header>
      <div className="space-y-4">
        {talents.map((talent, index) => (
          <TalentBriefCard
            key={talent.id}
            talent={talent}
            index={index}
            onInvite={onInvite}
            onSave={onSave}
            onAskAI={onAskAI}
          />
        ))}
      </div>
    </motion.section>
  );
};
