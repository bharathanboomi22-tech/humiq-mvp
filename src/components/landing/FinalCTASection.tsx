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
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#070A10' }}
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
      />

      {/* Background gradient - shifts subtly */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(124, 92, 255, 0.06), transparent 60%)',
        }}
        animate={shouldReduceMotion ? {} : {
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Primary Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="font-display text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground mb-6"
          >
            Let the signal speak first
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4"
          >
            HumIQ runs the first interview, forms a judgment, and tells you what matters — before you invest human time.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
            className="text-sm text-muted-foreground/60 mb-10"
          >
            No resumes. No screening. Just clearer hiring decisions.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }}
          >
            <Button
              onClick={handleClick}
              size="lg"
              className="relative px-8 py-6 text-base font-medium transition-all duration-300
                hover:scale-[1.03] hover:shadow-[0_0_40px_-10px_rgba(124,92,255,0.4)]"
              style={{
                background: 'linear-gradient(135deg, hsl(252 100% 68%) 0%, hsl(252 100% 60%) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              Run your first interview
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
