import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function FloatingNav() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 300) {
        if (currentScrollY < lastScrollY || currentScrollY === lastScrollY) {
          setIsVisible(true);
        } else {
          if (currentScrollY - lastScrollY > 10) {
            setIsVisible(false);
          }
        }
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            duration: shouldReduceMotion ? 0 : 0.3, 
            ease: 'easeOut' 
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div 
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border border-gray-100 shadow-premium"
          >
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-foreground hover:opacity-80 transition-opacity duration-300"
            >
              <span className="font-display text-base font-extrabold tracking-tight">
                HumiQ
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200" />

            {/* Love Letter Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/love-letter')}
              className="h-8 px-4 text-sm font-semibold"
            >
              Love Letters
            </Button>

            {/* CTA Button */}
            <Button
              size="sm"
              onClick={scrollToTop}
            >
              Get Started
            </Button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}