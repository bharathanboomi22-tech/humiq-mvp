import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FinalCTASectionProps {
  onCTAClick?: () => void;
}

export function FinalCTASection({ onCTAClick }: FinalCTASectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  const handleClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      navigate('/talent/onboarding');
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden bg-background"
    >
      {/* Atmospheric glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Primary Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-gradient-teal"
          >
            Ready to show how you really work?
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10"
          >
            Skip the resume. Start a real conversation with AI that understands your thinking.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          >
            <motion.button
              onClick={handleClick}
              className="btn-primary px-10 py-4 rounded-full text-base font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
