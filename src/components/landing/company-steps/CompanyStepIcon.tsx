import { motion, useReducedMotion } from 'framer-motion';
import { AISignalOrb } from '../talent-phases/AISignalOrb';

type StepType = 'define' | 'discover' | 'interview' | 'decide';
type OrbState = 'idle' | 'thinking' | 'processing' | 'complete';

interface CompanyStepIconProps {
  step: StepType;
  isInView: boolean;
}

export function CompanyStepIcon({ step, isInView }: CompanyStepIconProps) {
  const shouldReduceMotion = useReducedMotion();

  const getOrbState = (): OrbState => {
    if (!isInView) return 'idle';
    switch (step) {
      case 'define': return 'idle';
      case 'discover': return 'thinking';
      case 'interview': return 'processing';
      case 'decide': return 'complete';
      default: return 'idle';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-20 h-20 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px -8px rgba(91, 140, 255, 0.2), 0 4px 16px -4px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.7)',
      }}
    >
      {/* Gradient wash background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.08) 0%, rgba(185, 131, 255, 0.06) 50%, rgba(255, 143, 177, 0.04) 100%)',
        }}
      />

      {/* Step-specific icon content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {step === 'define' && <DefineIcon isInView={isInView} shouldReduceMotion={shouldReduceMotion} />}
        {step === 'discover' && <DiscoverIcon isInView={isInView} shouldReduceMotion={shouldReduceMotion} />}
        {step === 'interview' && <InterviewIcon isInView={isInView} shouldReduceMotion={shouldReduceMotion} />}
        {step === 'decide' && <DecideIcon isInView={isInView} shouldReduceMotion={shouldReduceMotion} />}
      </div>

      {/* AI Orb overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="absolute bottom-2 right-2"
      >
        <AISignalOrb state={getOrbState()} size={14} />
      </motion.div>

      {/* Glow halo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute -inset-2 -z-10 rounded-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(91, 140, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </motion.div>
  );
}

// Step 1: Define Role Intelligence - Abstract node network
function DefineIcon({ isInView, shouldReduceMotion }: { isInView: boolean; shouldReduceMotion: boolean | null }) {
  const nodes = [
    { x: 28, y: 28, delay: 0 },      // Center
    { x: 14, y: 18, delay: 0.1 },    // Top-left
    { x: 42, y: 16, delay: 0.15 },   // Top-right
    { x: 18, y: 42, delay: 0.2 },    // Bottom-left
    { x: 44, y: 40, delay: 0.25 },   // Bottom-right
  ];

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Connection lines from center */}
      {nodes.slice(1).map((node, i) => (
        <motion.line
          key={i}
          x1={28}
          y1={28}
          x2={node.x}
          y2={node.y}
          stroke="url(#lineGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: node.delay }}
        />
      ))}
      
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i === 0 ? 6 : 4}
          fill={i === 0 ? 'url(#orbGradient)' : 'rgba(91, 140, 255, 0.4)'}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: node.delay + 0.1 }}
        />
      ))}

      {/* Pulse on center node */}
      {isInView && !shouldReduceMotion && (
        <motion.circle
          cx={28}
          cy={28}
          r={6}
          fill="transparent"
          stroke="rgba(91, 140, 255, 0.4)"
          strokeWidth="1"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}

      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B983FF" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="50%" stopColor="#B983FF" />
          <stop offset="100%" stopColor="#FF8FB1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Step 2: Discover - Signal dots drifting toward center
function DiscoverIcon({ isInView, shouldReduceMotion }: { isInView: boolean; shouldReduceMotion: boolean | null }) {
  const signals = [
    { startX: 8, startY: 12, endX: 28, endY: 28, delay: 0 },
    { startX: 48, startY: 16, endX: 28, endY: 28, delay: 0.2 },
    { startX: 12, startY: 44, endX: 28, endY: 28, delay: 0.4 },
    { startX: 46, startY: 42, endX: 28, endY: 28, delay: 0.6 },
    { startX: 28, startY: 8, endX: 28, endY: 28, delay: 0.3 },
  ];

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Signal dots drifting toward center */}
      {signals.map((signal, i) => (
        <motion.circle
          key={i}
          r={3}
          fill="rgba(91, 140, 255, 0.7)"
          initial={{ cx: signal.startX, cy: signal.startY, opacity: 0.4 }}
          animate={isInView && !shouldReduceMotion ? {
            cx: [signal.startX, signal.endX],
            cy: [signal.startY, signal.endY],
            opacity: [0.4, 0.8, 0.4],
          } : {
            cx: signal.endX,
            cy: signal.endY,
            opacity: 0.6,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.5,
            delay: signal.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Center convergence point */}
      <motion.circle
        cx={28}
        cy={28}
        r={5}
        fill="url(#discoverGradient)"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />

      {/* Glow peak */}
      {isInView && !shouldReduceMotion && (
        <motion.circle
          cx={28}
          cy={28}
          r={5}
          fill="transparent"
          stroke="rgba(185, 131, 255, 0.5)"
          strokeWidth="2"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 2, opacity: [0, 0.6, 0] }}
          transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
        />
      )}

      <defs>
        <linearGradient id="discoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="100%" stopColor="#B983FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Step 3: Interview - Two shapes with pulse between
function InterviewIcon({ isInView, shouldReduceMotion }: { isInView: boolean; shouldReduceMotion: boolean | null }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Left shape */}
      <motion.rect
        x="8"
        y="18"
        width="14"
        height="20"
        rx="4"
        fill="rgba(91, 140, 255, 0.25)"
        initial={{ opacity: 0, x: -4 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
        transition={{ duration: 0.4 }}
      />

      {/* Right shape */}
      <motion.rect
        x="34"
        y="18"
        width="14"
        height="20"
        rx="4"
        fill="rgba(185, 131, 255, 0.25)"
        initial={{ opacity: 0, x: 4 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 4 }}
        transition={{ duration: 0.4 }}
      />

      {/* Connection line */}
      <motion.line
        x1="22"
        y1="28"
        x2="34"
        y2="28"
        stroke="rgba(143, 124, 255, 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Pulse traveling between shapes */}
      {isInView && !shouldReduceMotion && (
        <motion.circle
          r={3}
          fill="url(#pulseGradient)"
          initial={{ cx: 22, cy: 28, opacity: 0 }}
          animate={{
            cx: [22, 34],
            cy: 28,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Center orb glow during pulse */}
      <motion.circle
        cx={28}
        cy={28}
        r={4}
        fill="url(#pulseGradient)"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { 
          opacity: [0, 0.8, 0.6],
          scale: [0.5, 1.1, 1],
        } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      />

      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="50%" stopColor="#B983FF" />
          <stop offset="100%" stopColor="#FF8FB1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Step 4: Decide - One shape becomes crisp, others fade
function DecideIcon({ isInView, shouldReduceMotion }: { isInView: boolean; shouldReduceMotion: boolean | null }) {
  const shapes = [
    { x: 10, y: 20, selected: false },
    { x: 22, y: 12, selected: true },  // Selected
    { x: 36, y: 22, selected: false },
    { x: 24, y: 36, selected: false },
  ];

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {shapes.map((shape, i) => (
        <motion.rect
          key={i}
          x={shape.x}
          y={shape.y}
          width={12}
          height={12}
          rx={3}
          fill={shape.selected ? 'url(#selectedGradient)' : 'rgba(91, 140, 255, 0.2)'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? {
            opacity: shape.selected ? 1 : 0.3,
            scale: shape.selected ? 1.1 : 0.9,
          } : { opacity: 0, scale: 0.8 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            delay: i * 0.1 + 0.2,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Glow behind selected */}
      <motion.rect
        x={20}
        y={10}
        width={16}
        height={16}
        rx={4}
        fill="transparent"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          filter: 'blur(8px)',
          background: 'rgba(91, 140, 255, 0.3)',
        }}
      />

      {/* Selection indicator */}
      {isInView && !shouldReduceMotion && (
        <motion.rect
          x={22}
          y={12}
          width={12}
          height={12}
          rx={3}
          fill="transparent"
          stroke="rgba(91, 140, 255, 0.6)"
          strokeWidth="1.5"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.4, opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
        />
      )}

      <defs>
        <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="50%" stopColor="#B983FF" />
          <stop offset="100%" stopColor="#FF8FB1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
