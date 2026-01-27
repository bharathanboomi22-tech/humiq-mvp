import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ModeShiftStepProps {
  onContinue: () => void;
}

export const ModeShiftStep = ({ onContinue }: ModeShiftStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
    >
      {/* AI Orb - Idle breathing state */}
      <motion.div
        className="relative mb-12"
        animate={{
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-24 h-24 rounded-full cognitive-gradient opacity-90" />
        <div className="absolute inset-0 w-24 h-24 rounded-full cognitive-gradient blur-xl opacity-40" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6"
      >
        Hiring Intent Mode
      </motion.h1>

      {/* Primary message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl text-foreground/80 max-w-lg mb-4 leading-relaxed"
      >
        You're defining hiring intent.
        <br />
        HumiQ will handle discovery, interviews, and shortlisting.
      </motion.p>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-sm text-muted-foreground max-w-md mb-12"
      >
        This takes a few minutes. You won't need to screen candidates.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-3 px-8 py-6 text-base rounded-full bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white shadow-lg shadow-[#5B8CFF]/20"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
