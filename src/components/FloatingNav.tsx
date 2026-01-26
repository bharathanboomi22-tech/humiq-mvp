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
      
      // Show nav after scrolling past 300px
      if (currentScrollY > 300) {
        // Show when scrolling up or staying still
        if (currentScrollY < lastScrollY || currentScrollY === lastScrollY) {
          setIsVisible(true);
        } else {
          // Hide when scrolling down fast
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.9)',
            }}
          >
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity duration-300"
            >
              {/* AI Orb */}
              <div 
                className="w-5 h-5 rounded-full animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #5B8CFF, #8F7CFF, #B983FF, #FF8FB1)',
                  boxShadow: '0 0 8px rgba(91, 140, 255, 0.4)',
                }}
              />
              <span className="font-display text-base font-bold tracking-tight">
                HumiQ
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-foreground/10" />

            {/* Love Letter Button */}
            <Button
              size="sm"
              onClick={() => navigate('/love-letter')}
              className="relative h-8 px-4 text-sm font-medium text-white rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF 0%, #8F7CFF 35%, #B983FF 65%, #FF8FB1 100%)',
                boxShadow: '0 2px 12px rgba(91, 140, 255, 0.35)',
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #6B9CFF 0%, #9F8CFF 35%, #C993FF 65%, #FFA0C1 100%)',
                }}
              />
              <span className="relative z-10">Love Letters</span>
            </Button>

            {/* CTA Button */}
            <Button
              size="sm"
              onClick={scrollToTop}
              className="relative h-8 px-4 text-sm font-medium text-white rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF 0%, #8F7CFF 35%, #B983FF 65%, #FF8FB1 100%)',
                boxShadow: '0 2px 12px rgba(91, 140, 255, 0.35)',
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #6B9CFF 0%, #9F8CFF 35%, #C993FF 65%, #FFA0C1 100%)',
                }}
              />
              <span className="relative z-10">Get Started</span>
            </Button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
