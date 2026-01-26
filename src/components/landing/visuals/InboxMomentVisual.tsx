import { motion, useReducedMotion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface InboxMomentVisualProps {
  isInView: boolean;
}

export function InboxMomentVisual({ isInView }: InboxMomentVisualProps) {
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
      {/* Email Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.4, 
          delay: shouldReduceMotion ? 0 : 0.12,
          ease: 'easeOut' 
        }}
        className="p-5 rounded-xl bg-secondary"
      >
        {/* Email Icon */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Subject Line */}
            <p className="text-[15px] font-medium mb-1 text-foreground">
              HumiQ interview invitation
            </p>
            
            {/* Subtext */}
            <p className="text-[13px] mb-3 text-muted-foreground">
              Based on a relevant opportunity
            </p>
            
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ 
                duration: shouldReduceMotion ? 0 : 0.4, 
                delay: shouldReduceMotion ? 0 : 0.24,
                ease: 'easeOut' 
              }}
              className="inline-block px-3 py-1 rounded-full text-[11px] tracking-wide bg-foreground/5 text-foreground font-medium"
            >
              Automatically sent
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="text-sm text-center mt-5 text-muted-foreground">
        This just happens. No chasing.
      </p>
    </motion.div>
  );
}