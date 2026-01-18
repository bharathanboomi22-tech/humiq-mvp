import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface ActionSectionProps {
  candidateName?: string;
}

export function ActionSection({ candidateName }: ActionSectionProps) {
  const draftMessage = candidateName 
    ? `Hi ${candidateName.split(' ')[0]},\n\nI came across your work and was impressed by what I saw. We're building something early-stage and looking for a founding engineer who can own outcomes.\n\nWould you be open to a brief conversation?\n\nBest`
    : `Hi,\n\nI came across your work and was impressed by what I saw. We're building something early-stage and looking for a founding engineer who can own outcomes.\n\nWould you be open to a brief conversation?\n\nBest`;

  return (
    <motion.section 
      className="mb-16"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2.5 section-header mb-6">
        <Mail className="w-4 h-4 text-accent" />
        Send Interview Invite
      </div>

      <div className="space-y-6">
        {/* Draft outreach */}
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground mb-3">
            Draft outreach message:
          </p>
          <pre className="text-[15px] text-foreground/85 leading-relaxed whitespace-pre-wrap max-w-[65ch]">
            {draftMessage}
          </pre>
        </div>

        {/* Role framing */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Suggested role framing:
          </p>
          <p className="text-[15px] text-foreground/85 leading-relaxed max-w-[65ch]">
            Founding Engineer — full ownership of [core system]. 
            Report directly to founders. Equity stake.
          </p>
        </div>

        {/* First 30 days */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Suggested first 30 days:
          </p>
          <p className="text-[15px] text-foreground/85 leading-relaxed max-w-[65ch]">
            Ship one complete feature end-to-end. 
            Make one architectural decision that will last.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
