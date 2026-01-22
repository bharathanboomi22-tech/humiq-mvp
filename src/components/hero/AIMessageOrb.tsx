import { motion, useReducedMotion } from 'framer-motion';

type OrbState = 'idle' | 'thinking' | 'typing' | 'complete';

interface AIMessageOrbProps {
  state: OrbState;
  size?: number;
}

export function AIMessageOrb({ state, size = 16 }: AIMessageOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants based on orb state
  const getAnimation = () => {
    if (shouldReduceMotion) {
      return { opacity: state === 'complete' ? 0.8 : 1 };
    }

    switch (state) {
      case 'idle':
        return {
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        };
      case 'thinking':
        return {
          scale: [1, 1.2, 0.95, 1.1, 1],
          opacity: [0.8, 1, 0.9, 1, 0.8],
        };
      case 'typing':
        return {
          scale: [1, 1.1, 1],
          opacity: [0.9, 1, 0.9],
        };
      case 'complete':
        return {
          scale: 1,
          opacity: 0.85,
        };
      default:
        return { scale: 1, opacity: 0.8 };
    }
  };

  const getTransition = () => {
    if (shouldReduceMotion) {
      return { duration: 0.3 };
    }

    switch (state) {
      case 'idle':
        return {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
      case 'thinking':
        return {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
      case 'typing':
        return {
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
      case 'complete':
        return {
          duration: 0.4,
          ease: 'easeOut' as const,
        };
      default:
        return { duration: 0.3 };
    }
  };

  return (
    <div 
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #5B8CFF 0%, #B983FF 50%, #FF8FB1 100%)',
          filter: 'blur(4px)',
          opacity: 0.4,
        }}
        animate={state === 'typing' || state === 'thinking' ? {
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.2, 0.4],
        } : { scale: 1, opacity: 0.3 }}
        transition={{
          duration: state === 'thinking' ? 1 : 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #5B8CFF 0%, #B983FF 50%, #FF8FB1 100%)',
          boxShadow: '0 2px 8px rgba(91, 140, 255, 0.4)',
        }}
        animate={getAnimation()}
        transition={getTransition()}
      />

      {/* Inner highlight */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '15%',
          left: '20%',
          width: '35%',
          height: '35%',
          background: 'rgba(255, 255, 255, 0.6)',
          filter: 'blur(1px)',
        }}
        animate={state === 'complete' ? { opacity: 0.4 } : { opacity: [0.5, 0.8, 0.5] }}
        transition={{
          duration: 2,
          repeat: state === 'complete' ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Ripple effect for thinking state */}
      {state === 'thinking' && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-[-4px] rounded-full"
          style={{
            border: '1px solid',
            borderColor: 'rgba(185, 131, 255, 0.5)',
          }}
          animate={{
            scale: [1, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
