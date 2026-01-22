import { motion, useReducedMotion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AIOrb() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  
  // Mouse tracking for subtle parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for orb movement
  const springConfig = { stiffness: 50, damping: 30 };
  const orbX = useSpring(useTransform(mouseX, [-500, 500], [-15, 15]), springConfig);
  const orbY = useSpring(useTransform(mouseY, [-500, 500], [-15, 15]), springConfig);

  useEffect(() => {
    setMounted(true);
    
    if (shouldReduceMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Ambient gradient bloom - very subtle */}
      <motion.div
        className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(91, 140, 255, 0.06) 0%, rgba(185, 131, 255, 0.04) 40%, rgba(255, 143, 177, 0.03) 70%, transparent 100%)',
          filter: 'blur(60px)',
          x: shouldReduceMotion ? 0 : orbX,
          y: shouldReduceMotion ? 0 : orbY,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Main AI Orb */}
      <motion.div
        className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px]"
        style={{
          x: shouldReduceMotion ? 0 : orbX,
          y: shouldReduceMotion ? 0 : orbY,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at 30% 30%, rgba(91, 140, 255, 0.12) 0%, rgba(185, 131, 255, 0.08) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main orb body */}
        <motion.div
          className="absolute inset-[10%] rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 35% 25%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(91, 140, 255, 0.15) 0%, rgba(185, 131, 255, 0.12) 30%, rgba(255, 143, 177, 0.08) 60%, rgba(247, 247, 248, 0.95) 100%)
            `,
            boxShadow: `
              inset 0 0 60px rgba(255, 255, 255, 0.6),
              inset 0 -20px 40px rgba(185, 131, 255, 0.08),
              0 20px 60px -20px rgba(91, 140, 255, 0.15),
              0 40px 80px -30px rgba(185, 131, 255, 0.12)
            `,
          }}
          animate={shouldReduceMotion ? {} : {
            rotate: [0, 360],
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner gradient motion */}
        <motion.div
          className="absolute inset-[15%] rounded-full overflow-hidden"
          animate={shouldReduceMotion ? {} : {
            rotate: [0, -360],
          }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                conic-gradient(
                  from 0deg at 50% 50%,
                  rgba(91, 140, 255, 0.08) 0deg,
                  rgba(185, 131, 255, 0.06) 120deg,
                  rgba(255, 143, 177, 0.05) 240deg,
                  rgba(91, 140, 255, 0.08) 360deg
                )
              `,
              filter: 'blur(20px)',
            }}
          />
        </motion.div>

        {/* Glass highlight */}
        <motion.div
          className="absolute inset-[12%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 70% 40% at 30% 20%, rgba(255, 255, 255, 0.5) 0%, transparent 60%)',
          }}
          animate={shouldReduceMotion ? {} : {
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle pulse ring */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(185, 131, 255, 0.1)',
            }}
            animate={{
              scale: [1, 1.15, 1.3],
              opacity: [0.3, 0.15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
