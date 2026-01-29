import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function FloatingNav() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 400) {
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
          <div className="flex items-center gap-4 px-5 py-3 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-[#111111] hover:opacity-80 transition-opacity duration-300"
            >
              <span className="font-display text-base font-extrabold tracking-tight">
                HumiQ
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-hot/10 text-pink-hot">
                Beta
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200" />

            {/* Love Letter Button */}
            <button
              onClick={() => navigate('/love-letter')}
              className="text-sm font-medium text-[#111111] hover:text-pink-hot transition-colors"
            >
              Love Letters
            </button>

            {/* CTA Button */}
            <motion.button
              onClick={scrollToTop}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
