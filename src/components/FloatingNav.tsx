import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function FloatingNav() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const urlMode = searchParams.get('mode');
  const activeTab = urlMode === 'hiring' ? 'company' : 'talent';

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

  const handleTabSwitch = (tab: 'talent' | 'company') => {
    setSearchParams({ mode: tab === 'company' ? 'hiring' : 'talent' });
    scrollToTop();
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
          <div className="flex items-center gap-4 px-5 py-3 rounded-full glass-card shadow-glow-teal">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity duration-300"
            >
              <span className="font-display text-base font-extrabold tracking-tight">
                HumiQ
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Beta
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-border" />

            {/* Toggle */}
            <div className="hidden md:flex items-center gap-0 bg-secondary rounded-full p-0.5">
              <button
                onClick={() => handleTabSwitch('talent')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeTab === 'talent' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Talent
              </button>
              <button
                onClick={() => handleTabSwitch('company')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeTab === 'company' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hiring
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-border" />

            {/* CTA Button */}
            <motion.button
              onClick={scrollToTop}
              className="btn-primary px-5 py-2 rounded-full text-sm font-semibold"
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
