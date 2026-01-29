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
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ready to show how you really work?
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="text-base md:text-lg text-[#111111]/60 leading-relaxed mb-10"
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
              className="px-10 py-4 rounded-full text-base font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 8px 32px rgba(255, 47, 178, 0.4)',
              }}
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
