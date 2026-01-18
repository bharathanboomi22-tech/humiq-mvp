import { motion, AnimatePresence } from 'framer-motion';
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
    <section className="mb-16">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 section-header hover:text-foreground transition-colors duration-200"
      >
        Take Action
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-220 ease-out ${isOpen ? 'rotate-180' : ''}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: easing }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-6">
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
