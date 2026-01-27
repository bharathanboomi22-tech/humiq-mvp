import { motion } from 'framer-motion';
import { MessageSquare, Bookmark, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TalentBrief, TIER_CONFIG } from './types';

interface TalentBriefCardProps {
  talent: TalentBrief;
  index: number;
  onInvite: (id: string) => void;
  onSave: (id: string) => void;
  onAskAI: (id: string) => void;
}

export const TalentBriefCard = ({
  talent,
  index,
  onInvite,
  onSave,
  onAskAI,
}: TalentBriefCardProps) => {
  const config = TIER_CONFIG[talent.tier];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        'glass-card p-6 border transition-all duration-300 hover:shadow-lg',
        config.bgClass,
        config.borderClass
      )}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{talent.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Work Identity</p>
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            config.labelClass
          )}
        >
          {config.label}
        </span>
      </header>

      <div className="space-y-5">
        {/* Section 1: How they work */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            How they work
          </h4>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {talent.workIdentity.howTheyWork}
          </p>
        </section>

        {/* Section 2: How they decide */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            How they decide
          </h4>
          <ul className="space-y-1.5">
            {talent.workIdentity.howTheyDecide.map((point, i) => (
              <li key={i} className="text-sm text-foreground/85 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: What to be aware of */}
        <section>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            What to be aware of
          </h4>
          <ul className="space-y-1.5">
            {talent.workIdentity.whatToBeAwareOf.map((point, i) => (
              <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-foreground/30 mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Interview highlights */}
        <section className="pt-3 border-t border-white/40">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Interview highlights
          </h4>
          <div className="space-y-2">
            {talent.interviewHighlights.map((highlight, i) => (
              <p key={i} className="text-sm italic text-foreground/70">
                "{highlight}"
              </p>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors">
            <Play className="w-3 h-3" />
            Watch AI interview moments
          </button>
        </section>
      </div>

      {/* Actions */}
      <footer className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-white/40">
        <Button
          size="sm"
          onClick={() => onInvite(talent.id)}
          className="gap-2 cognitive-gradient text-white hover:opacity-90"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Invite to final conversation
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSave(talent.id)}
          className="gap-2"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Save for future roles
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAskAI(talent.id)}
          className="gap-2 text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI about this decision
        </Button>
      </footer>
    </motion.article>
  );
};
