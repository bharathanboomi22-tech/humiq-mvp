import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyStepProps {
  onContinue: () => void;
  onLearnMore: () => void;
}

export function SafetyStep({ onContinue, onLearnMore }: SafetyStepProps) {
  return (
    <div className="text-center py-8 md:py-12 max-w-lg mx-auto">
      {/* AI Orb Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative inline-flex items-center justify-center w-24 h-24 mb-10"
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] opacity-20 blur-xl animate-pulse" />
        {/* Inner orb */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex items-center justify-center shadow-lg">
          <Shield className="w-9 h-9 text-white" />
        </div>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-5 leading-tight"
      >
        You don't need a CV here.
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-lg text-muted-foreground mb-4 leading-relaxed"
      >
        We'll start by understanding how you work — calmly, together.
      </motion.p>

      {/* Micro reassurance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-10"
      >
        <Sparkles className="w-4 h-4" />
        No scoring. No rejection. Just real work.
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white shadow-lg"
        >
          Begin
          <ArrowRight className="w-4 h-4" />
        </Button>

        <button
          onClick={onLearnMore}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" />
          How this works
        </button>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground/70"
      >
        <span>Private by default</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>AI-powered insights</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span>No applications</span>
      </motion.div>
    </div>
  );
}
