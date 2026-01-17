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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.3 }}
      className="mb-16"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        Take Action
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.15 }}
          className="mt-8 space-y-8"
        >
          {/* Draft outreach */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Draft outreach message:
            </p>
            <pre className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap p-4 bg-card rounded border border-border">
              {draftMessage}
            </pre>
          </div>

          {/* Role framing */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Suggested role framing:
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Founding Engineer — full ownership of [core system]. 
              Report directly to founders. Equity stake.
            </p>
          </div>

          {/* First 30 days */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Suggested first 30 days:
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Ship one complete feature end-to-end. 
              Make one architectural decision that will last.
            </p>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}