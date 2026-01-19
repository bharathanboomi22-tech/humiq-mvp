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
        duration: shouldReduceMotion ? 0 : 0.4, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-[20px] backdrop-blur-[12px]"
      style={{ 
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0px 40px 80px rgba(0,0,0,0.45)'
      }}
    >
      {/* Email Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.3, 
          delay: shouldReduceMotion ? 0 : 0.12,
          ease: 'easeOut' 
        }}
        className="p-5 rounded-[14px]"
        style={{ 
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Email Icon */}
        <div className="flex items-start gap-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Mail 
              className="w-5 h-5" 
              style={{ color: 'rgba(255,255,255,0.7)' }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Subject Line */}
            <p 
              className="text-[15px] font-medium mb-1"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              HumIQ interview invitation
            </p>
            
            {/* Subtext */}
            <p 
              className="text-[13px] mb-3"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Based on a relevant opportunity
            </p>
            
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ 
                duration: shouldReduceMotion ? 0 : 0.3, 
                delay: shouldReduceMotion ? 0 : 0.24,
                ease: 'easeOut' 
              }}
              className="inline-block px-3 py-1 rounded-full text-[11px] tracking-wide"
              style={{ 
                background: 'rgba(51, 214, 166, 0.1)',
                color: 'rgba(51, 214, 166, 0.9)',
                border: '1px solid rgba(51, 214, 166, 0.2)'
              }}
            >
              Automatically sent
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <p 
        className="text-sm text-center mt-5"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        This just happens. No chasing.
      </p>
    </motion.div>
  );
}
