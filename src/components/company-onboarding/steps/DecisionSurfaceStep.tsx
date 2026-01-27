import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CandidateTier = 'strong' | 'contextual' | 'future';

interface Candidate {
  id: string;
  name: string;
  tier: CandidateTier;
  howTheyWork: string;
  howTheyDecide: string;
  risksAndGrowth: string;
  interviewHighlight: string;
}

// Mock candidates for demonstration
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Alex Chen',
    tier: 'strong',
    howTheyWork: 'Ships independently, prefers async communication, documents decisions proactively',
    howTheyDecide: 'Trade-off focused, weighs long-term implications, comfortable with reversible decisions',
    risksAndGrowth: 'May need coaching on stakeholder communication; strong technical intuition',
    interviewHighlight: 'I would rather ship something imperfect and learn than wait for consensus.',
  },
  {
    id: '2',
    name: 'Jordan Rivera',
    tier: 'strong',
    howTheyWork: 'Collaborative but autonomous, excels in ambiguous environments',
    howTheyDecide: 'First-principles thinking, seeks minimal viable clarity before moving',
    risksAndGrowth: 'Can move too fast for some teams; excellent ownership mentality',
    interviewHighlight: 'Clarity is my responsibility, not something I wait for.',
  },
  {
    id: '3',
    name: 'Sam Patel',
    tier: 'contextual',
    howTheyWork: 'Structured approach, strong in complex systems, methodical executor',
    howTheyDecide: 'Data-informed, prefers validated approaches, reduces risk systematically',
    risksAndGrowth: 'Thrives in structured environments; may need adjustment to fast-paced startup culture',
    interviewHighlight: 'I build systems that scale, not quick fixes.',
  },
  {
    id: '4',
    name: 'Morgan Kim',
    tier: 'future',
    howTheyWork: 'Currently at larger company, shows strong growth trajectory',
    howTheyDecide: 'Learning to own decisions independently, strong analytical foundation',
    risksAndGrowth: 'Would benefit from mentorship; high potential for the next 12-18 months',
    interviewHighlight: 'I want to own outcomes, not just complete tasks.',
  },
];

const TIER_CONFIG: Record<CandidateTier, { label: string; bgClass: string; labelClass: string }> = {
  strong: {
    label: 'Strong Hire',
    bgClass: 'bg-emerald-50 border-emerald-200',
    labelClass: 'text-emerald-700 bg-emerald-100',
  },
  contextual: {
    label: 'Contextual Fit',
    bgClass: 'bg-amber-50/50 border-amber-200',
    labelClass: 'text-amber-700 bg-amber-100',
  },
  future: {
    label: 'Future Fit',
    bgClass: 'bg-slate-50 border-slate-200',
    labelClass: 'text-slate-600 bg-slate-100',
  },
};

interface DecisionSurfaceStepProps {
  onComplete: () => void;
}

export const DecisionSurfaceStep = ({ onComplete }: DecisionSurfaceStepProps) => {
  const groupedCandidates = {
    strong: MOCK_CANDIDATES.filter((c) => c.tier === 'strong'),
    contextual: MOCK_CANDIDATES.filter((c) => c.tier === 'contextual'),
    future: MOCK_CANDIDATES.filter((c) => c.tier === 'future'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-6 pb-16"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex mb-4"
        >
          <div className="w-12 h-12 rounded-full cognitive-gradient flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3"
        >
          Decision-ready talent
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          These people have already been interviewed and understood by HumiQ.
        </motion.p>
      </div>

      {/* Candidate Groups */}
      {(['strong', 'contextual', 'future'] as const).map((tier, groupIndex) => (
        <motion.div
          key={tier}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + groupIndex * 0.15 }}
          className="mb-8"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            {TIER_CONFIG[tier].label}
          </h2>
          <div className="space-y-4">
            {groupedCandidates[tier].map((candidate, index) => (
              <CandidateCard key={candidate.id} candidate={candidate} index={index} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <Button
          onClick={onComplete}
          size="lg"
          className="gap-2 px-8 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

const CandidateCard = ({
  candidate,
  index,
}: {
  candidate: Candidate;
  index: number;
}) => {
  const config = TIER_CONFIG[candidate.tier];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'glass-card p-6 border transition-all duration-300 hover:shadow-lg',
        config.bgClass
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Left: Name and tier */}
        <div className="flex-shrink-0 md:w-40">
          <h3 className="font-semibold text-foreground text-lg">{candidate.name}</h3>
          <span
            className={cn(
              'inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium',
              config.labelClass
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                How they work
              </p>
              <p className="text-sm text-foreground/80">{candidate.howTheyWork}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                How they decide
              </p>
              <p className="text-sm text-foreground/80">{candidate.howTheyDecide}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Risks & growth notes
            </p>
            <p className="text-sm text-foreground/80">{candidate.risksAndGrowth}</p>
          </div>

          {/* Interview highlight */}
          <div className="pt-2 border-t border-white/40">
            <p className="text-sm italic text-foreground/70">&quot;{candidate.interviewHighlight}&quot;</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#5B8CFF] to-[#B983FF] text-white hover:opacity-90"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Invite to final conversation
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Bookmark className="w-3.5 h-3.5" />
              Save for later
            </Button>
            <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI about this decision
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
