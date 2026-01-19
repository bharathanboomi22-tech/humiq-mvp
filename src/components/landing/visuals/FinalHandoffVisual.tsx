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
      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.3, 
          delay: shouldReduceMotion ? 0 : 0.12,
          ease: 'easeOut' 
        }}
        className="flex flex-col items-center py-6"
      >
        {/* Human Icon */}
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ 
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <User 
            className="w-7 h-7"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </div>

        {/* Main Text */}
        <p 
          className="text-[17px] font-medium mb-2"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          Interview requested
        </p>

        {/* Subtext */}
        <p 
          className="text-[14px] mb-5"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Signal strong enough for humans
        </p>

        {/* Divider */}
        <div 
          className="w-16 h-px mb-5"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />

        {/* Footer */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ 
            duration: shouldReduceMotion ? 0 : 0.3, 
            delay: shouldReduceMotion ? 0 : 0.24,
            ease: 'easeOut' 
          }}
          className="text-[13px]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          AI steps back here
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
