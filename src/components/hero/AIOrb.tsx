import { motion, useReducedMotion, useMotionValue, useTransform, useSpring, type Transition } from 'framer-motion';
import { useEffect, useState } from 'react';

type OrbState = 'idle' | 'thinking' | 'writing' | 'decision';

interface AIOrbProps {
  state?: OrbState;
}

export function AIOrb({ state = 'idle' }: AIOrbProps) {
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

  // State-based animation configurations
  const getBreathingAnimation = () => {
    if (shouldReduceMotion) return {};
    
    switch (state) {
      case 'thinking':
        return { scale: [1, 1.02, 1] };
      case 'writing':
        return { scale: [1, 1.05, 1] };
      case 'decision':
        return { scale: [1, 1.15, 1], opacity: [1, 0.9, 1] };
      default: // idle - slow breathing
        return { scale: [1, 1.03, 1] };
    }
  };

  const getBreathingTransition = (): Transition => {
    switch (state) {
      case 'thinking':
        return { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };
      case 'writing':
        return { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const };
      case 'decision':
        return { duration: 0.6, ease: 'easeOut' as const };
      default:
        return { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Ambient bloom - violet to pink */}
      <motion.div
        className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(124, 58, 237, 0.08) 0%,
              rgba(255, 47, 178, 0.05) 30%,
              rgba(255, 107, 214, 0.03) 60%,
              transparent 100%
            )
          `,
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
        {/* Outer halo glow - Violet to Pink gradient */}
        <motion.div
          className="absolute inset-[-20%] rounded-full"
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 50%,
                rgba(124, 58, 237, 0.12) 0%,
                rgba(255, 47, 178, 0.08) 40%,
                rgba(255, 107, 214, 0.04) 70%,
                transparent 100%
              )
            `,
            filter: 'blur(50px)',
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />

        {/* Main orb body - layered violet/pink gradients */}
        <motion.div
          className="absolute inset-[10%] rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 30% 25%, rgba(255, 255, 255, 0.95) 0%, transparent 50%),
              radial-gradient(ellipse 80% 70% at 40% 40%, rgba(124, 58, 237, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 100% 100% at 50% 50%, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(167, 139, 250, 0.25) 30%, 
                rgba(255, 47, 178, 0.2) 50%,
                rgba(255, 107, 214, 0.15) 70%, 
                rgba(255, 255, 255, 0.85) 100%
              )
            `,
            boxShadow: `
              inset 0 0 80px rgba(255, 255, 255, 0.7),
              inset 0 -30px 60px rgba(167, 139, 250, 0.15),
              0 20px 60px -20px rgba(255, 47, 178, 0.25),
              0 40px 80px -30px rgba(124, 58, 237, 0.20)
            `,
          }}
          animate={getBreathingAnimation()}
          transition={getBreathingTransition()}
        />

        {/* Inner gradient motion - thinking rotation */}
        <motion.div
          className="absolute inset-[15%] rounded-full overflow-hidden"
          animate={shouldReduceMotion ? {} : {
            rotate: [0, state === 'thinking' ? 360 : -360],
          }}
          transition={{
            duration: state === 'thinking' ? 8 : 120,
            repeat: Infinity,
            ease: 'linear' as const,
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                conic-gradient(
                  from 0deg at 50% 50%,
                  rgba(124, 58, 237, 0.10) 0deg,
                  rgba(255, 47, 178, 0.06) 120deg,
                  rgba(255, 107, 214, 0.08) 240deg,
                  rgba(124, 58, 237, 0.10) 360deg
                )
              `,
              filter: 'blur(20px)',
            }}
          />
        </motion.div>

        {/* Glass highlight - top-left shine */}
        <motion.div
          className="absolute inset-[12%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 70% 40% at 30% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
          }}
          animate={shouldReduceMotion ? {} : {
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
        />

        {/* Writing state - inner pulse */}
        {state === 'writing' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-[25%] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 47, 178, 0.4) 0%, transparent 70%)',
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        )}

        {/* Decision state - brief glow peak */}
        {state === 'decision' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-[-10%] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 47, 178, 0.3) 0%, transparent 60%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut' as const,
            }}
          />
        )}

        {/* Subtle pulse ring - idle breathing */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(255, 47, 178, 0.2)',
            }}
            animate={{
              scale: [1, 1.15, 1.3],
              opacity: [0.4, 0.2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeOut' as const,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}