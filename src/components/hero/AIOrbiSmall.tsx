import { motion, useReducedMotion } from 'framer-motion';

interface AIOrbiSmallProps {
  isWriting?: boolean;
}

/**
 * Smaller AI Orbi variant for Hero card dialogue lines
 * Desktop: 16px, Mobile: 12px - subtle thinking indicator
 */
export function AIOrbiSmall({ isWriting = false }: AIOrbiSmallProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-4 h-4 md:w-[16px] md:h-[16px]">
      {/* Outer glow halo - teal/green */}
      <motion.div
        className="absolute inset-[-40%] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, hsl(168 75% 48% / 0.15) 40%, transparent 70%)',
          filter: 'blur(4px)',
        }}
        animate={shouldReduceMotion ? {} : {
          scale: isWriting ? [1, 1.25, 1] : [1, 1.08, 1],
          opacity: isWriting ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isWriting ? 0.6 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb sphere - teal gradient */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, hsl(168 75% 48% / 0.6) 30%, hsl(var(--primary)) 60%, hsl(160 75% 35%) 100%)',
          boxShadow: isWriting 
            ? '0 0 12px hsl(var(--primary) / 0.6), inset 0 0 6px rgba(255, 255, 255, 0.3)'
            : '0 0 8px hsl(var(--primary) / 0.4), inset 0 0 4px rgba(255, 255, 255, 0.2)',
        }}
        animate={shouldReduceMotion ? {} : {
          scale: isWriting ? [1, 1.1, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: isWriting ? 0.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner shine highlight */}
      <motion.div
        className="absolute top-[15%] left-[20%] w-[30%] h-[30%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, transparent 70%)',
        }}
        animate={shouldReduceMotion ? {} : {
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Spark dots during writing - smaller and subtler */}
      {isWriting && !shouldReduceMotion && (
        <>
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white"
              style={{
                top: '50%',
                left: '50%',
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 20],
                y: [0, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 20],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
