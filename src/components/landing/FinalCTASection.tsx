import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FinalCTASectionProps {
  onCTAClick?: () => void;
}

export function FinalCTASection({ onCTAClick }: FinalCTASectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const handleClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Scroll to top where the input form is
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden bg-secondary"
    >
      {/* Background gradient orb - soft pink glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div 
          className="w-[400px] h-[400px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Primary Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-6"
          >
            Let the signal speak first
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4"
          >
            HumIQ runs the first interview, forms a judgment, and tells you what matters — before you invest human time.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            className="text-sm text-muted-foreground mb-10"
          >
            No resumes. No screening. Just clearer hiring decisions.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
          >
            <Button
              onClick={handleClick}
              size="lg"
              className="px-10 py-6 text-base"
            >
              Run your first interview
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}