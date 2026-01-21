import { motion, useReducedMotion } from 'framer-motion';
import { User } from 'lucide-react';

interface FinalHandoffVisualProps {
  isInView: boolean;
}

export function FinalHandoffVisual({ isInView }: FinalHandoffVisualProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.5, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-2xl glass-card"
    >
      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.4, 
          delay: shouldReduceMotion ? 0 : 0.12,
          ease: 'easeOut' 
        }}
        className="flex flex-col items-center py-6"
      >
        {/* Human Icon */}
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-foreground" />
        </div>

        {/* Main Text */}
        <p className="text-[17px] font-bold mb-2 text-foreground font-display">
          Interview requested
        </p>

        {/* Subtext */}
        <p className="text-[14px] mb-5 text-muted-foreground">
          Signal strong enough for humans
        </p>

        {/* Divider */}
        <div className="w-16 h-px mb-5 bg-foreground/10" />

        {/* Footer */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ 
            duration: shouldReduceMotion ? 0 : 0.4, 
            delay: shouldReduceMotion ? 0 : 0.24,
            ease: 'easeOut' 
          }}
          className="text-[13px] text-muted-foreground"
        >
          AI steps back here
        </motion.span>
      </motion.div>
    </motion.div>
  );
}