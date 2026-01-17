import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { ActionLayer } from '@/types/brief';

interface ActionLayerSectionProps {
  action: ActionLayer;
}

export function ActionLayerSection({ action }: ActionLayerSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(action.outreachMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: 0.3, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <h2 className="font-display text-xl font-medium text-foreground text-left">
          Take Action
        </h2>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </button>
      
      <p className="text-sm text-muted-foreground mt-1">
        Outreach, role framing, and first 30 days
      </p>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-6">
              {/* Outreach Message */}
              <div className="p-5 rounded-lg bg-card border border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Draft Outreach Message
                </p>
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-body leading-relaxed mb-4">
                  {action.outreachMessage}
                </pre>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Role Framing */}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Suggested Role Framing
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {action.roleFraming}
                </p>
              </div>

              {/* First 30 Days */}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  First 30 Days Expectations
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {action.first30Days}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
