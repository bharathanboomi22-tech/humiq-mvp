import { motion, useReducedMotion } from 'framer-motion';

type OrbState = 'idle' | 'thinking' | 'typing' | 'processing' | 'complete';

interface AISignalOrbProps {
  state: OrbState;
  size?: number;
}

export function AISignalOrb({ state, size = 24 }: AISignalOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  const getAnimation = () => {
    if (shouldReduceMotion) {
      return { scale: 1, opacity: 1 };
    }

    switch (state) {
      case 'thinking':
        return {
          scale: [1, 1.15, 1, 1.1, 1],
          opacity: [1, 0.9, 1, 0.95, 1],
        };
      case 'typing':
      case 'processing':
        return {
          scale: [1, 1.05, 1, 1.03, 1],
          opacity: 1,
        };
      case 'complete':
        return {
          scale: [1.1, 1],
          opacity: 1,
        };
      default: // idle
        return {
          scale: [1, 1.04, 1],
          opacity: [1, 0.95, 1],
        };
    }
  };

  const getTransition = () => {
    if (shouldReduceMotion) {
      return { duration: 0 };
    }

    switch (state) {
      case 'thinking':
        return {
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
      case 'typing':
      case 'processing':
        return {
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
      case 'complete':
        return {
          duration: 0.4,
          ease: 'easeOut' as const,
        };
      default: // idle
        return {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <motion.div
        animate={state === 'thinking' || state === 'processing' ? {
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.3, 1],
        } : {
          opacity: 0.3,
          scale: 1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 1.2,
          repeat: state === 'thinking' || state === 'processing' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #8ff2ff, #92f6f0, #67edfa)',
          filter: `blur(${size * 0.4}px)`,
        }}
      />
      
      {/* Main orb */}
      <motion.div
        animate={getAnimation()}
        transition={getTransition()}
        className="relative w-full h-full rounded-full"
        style={{
          background: 'linear-gradient(135deg, #8ff2ff 0%, #92f6f0 40%, #67edfa 70%, #8ff2ff 100%)',
          boxShadow: `0 0 ${size * 0.5}px rgba(143, 242, 255, 0.5), 0 0 ${size}px rgba(103, 237, 250, 0.3)`,
        }}
      >
        {/* Inner highlight */}
        <motion.div
          animate={state !== 'complete' ? {
            opacity: [0.6, 0.9, 0.6],
          } : { opacity: 0.7 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.5,
            repeat: state !== 'complete' ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full"
          style={{
            top: '15%',
            left: '15%',
            width: '35%',
            height: '35%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Thinking ripple effect */}
      {state === 'thinking' && !shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(143, 242, 255, 0.4)',
          }}
        />
      )}
    </div>
  );
}
