import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ActionSectionProps {
  candidateName?: string;
}

export function ActionSection({ candidateName }: ActionSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const draftMessage = candidateName 
    ? `Hi ${candidateName.split(' ')[0]},\n\nI came across your work and was impressed by what I saw. We're building something early-stage and looking for a founding engineer who can own outcomes.\n\nWould you be open to a brief conversation?\n\nBest`
    : `Hi,\n\nI came across your work and was impressed by what I saw. We're building something early-stage and looking for a founding engineer who can own outcomes.\n\nWould you be open to a brief conversation?\n\nBest`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        Take Action
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-10 space-y-10"
        >
          {/* Draft outreach */}
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Draft outreach message:
            </p>
            <pre className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-wrap p-5 bg-card rounded-lg border border-border/60">
              {draftMessage}
            </pre>
          </div>

          {/* Role framing */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Suggested role framing:
            </p>
            <p className="text-[15px] text-foreground/80 leading-relaxed">
              Founding Engineer — full ownership of [core system]. 
              Report directly to founders. Equity stake.
            </p>
          </div>

          {/* First 30 days */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Suggested first 30 days:
            </p>
            <p className="text-[15px] text-foreground/80 leading-relaxed">
              Ship one complete feature end-to-end. 
              Make one architectural decision that will last.
            </p>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}