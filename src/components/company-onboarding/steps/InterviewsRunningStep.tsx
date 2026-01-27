import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface InterviewsRunningStepProps {
  roleName: string;
  onComplete: () => void;
}

const STATUS_MESSAGES = [
  'Discovering aligned talent…',
  'Running AI interviews…',
  'Analyzing decision patterns…',
  'Understanding work styles…',
  'Building decision briefs…',
];

export const InterviewsRunningStep = ({
  roleName,
  onComplete,
}: InterviewsRunningStepProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);

    // Auto-complete after simulation
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
    >
      {/* Large animated AI Orb */}
      <motion.div
        className="relative mb-16"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(91,140,255,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(185,131,255,0.1) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1.1, 1.5, 1.1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Main orb */}
        <motion.div
          className="w-32 h-32 rounded-full cognitive-gradient relative z-10"
          animate={{
            boxShadow: [
              '0 0 40px rgba(91, 140, 255, 0.4)',
              '0 0 60px rgba(185, 131, 255, 0.5)',
              '0 0 40px rgba(255, 143, 177, 0.4)',
              '0 0 40px rgba(91, 140, 255, 0.4)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-white/80"
            style={{
              top: '50%',
              left: '50%',
              marginTop: '-6px',
              marginLeft: '-6px',
            }}
            animate={{
              rotate: 360,
              x: [0, Math.cos((i * 2 * Math.PI) / 3) * 50],
              y: [0, Math.sin((i * 2 * Math.PI) / 3) * 50],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4"
      >
        AI interviews are running
      </motion.h1>

      {/* Role context */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        For: <span className="text-foreground">{roleName}</span>
      </motion.p>

      {/* Rotating status message */}
      <motion.div
        className="h-8 flex items-center justify-center"
        key={messageIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-[#5B8CFF]">{STATUS_MESSAGES[messageIndex]}</p>
      </motion.div>

      {/* Reassurance text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-muted-foreground mt-12 max-w-sm"
      >
        HumiQ is discovering and interviewing aligned talent.
        <br />
        You don't need to screen or schedule anything.
      </motion.p>
    </motion.div>
  );
};
