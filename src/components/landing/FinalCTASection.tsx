import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      className="py-24 md:py-32 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Primary Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-gradient">Ready to show how you really work?</span>
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
            <Button
              onClick={handleClick}
              size="lg"
              className="px-10 py-6 text-base font-bold animate-pulse-glow"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}