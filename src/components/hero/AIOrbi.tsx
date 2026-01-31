import { motion, useReducedMotion } from 'framer-motion';

interface AIOrbiProps {
  size?: 'sm' | 'md' | 'lg';
  isWriting?: boolean;
}

export function AIOrbi({ size = 'md', isWriting = false }: AIOrbiProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer glow halo - teal/green */}
      <motion.div
        className="absolute inset-[-50%] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(168 75% 48% / 0.2) 40%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={shouldReduceMotion ? {} : {
          scale: isWriting ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isWriting ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isWriting ? 0.8 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb sphere - teal gradient */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, hsl(168 75% 48% / 0.6) 30%, hsl(var(--primary)) 60%, hsl(160 75% 35%) 100%)',
          boxShadow: '0 0 20px hsl(var(--primary) / 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)',
        }}
        animate={shouldReduceMotion ? {} : {
          scale: isWriting ? [1, 1.08, 1] : [1, 1.03, 1],
        }}
        transition={{
          duration: isWriting ? 0.6 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner shine highlight */}
      <motion.div
        className="absolute top-[15%] left-[20%] w-[35%] h-[35%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
        }}
        animate={shouldReduceMotion ? {} : {
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Spark dots during writing */}
      {isWriting && !shouldReduceMotion && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
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
                x: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 40],
                y: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 40],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.2,
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
