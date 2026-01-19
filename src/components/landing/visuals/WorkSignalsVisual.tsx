import { motion, useReducedMotion } from 'framer-motion';
import { Video, Code, Palette, FileText } from 'lucide-react';

const signalTiles = [
  { icon: Video, label: 'AI Walkthrough' },
  { icon: Code, label: 'Code / Repo' },
  { icon: Palette, label: 'Design / Prototype' },
  { icon: FileText, label: 'Docs / Writing' },
];

interface WorkSignalsVisualProps {
  isInView: boolean;
}

export function WorkSignalsVisual({ isInView }: WorkSignalsVisualProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.4, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-[20px] backdrop-blur-[12px]"
      style={{ 
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0px 40px 80px rgba(0,0,0,0.45)'
      }}
    >
      {/* Card Header */}
      <p 
        className="text-[11px] tracking-[0.12em] uppercase text-center mb-5"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        WORK SIGNALS
      </p>

      {/* Signal Tiles Grid */}
      <div className="grid grid-cols-2 gap-4">
        {signalTiles.map((tile, index) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ 
              duration: shouldReduceMotion ? 0 : 0.3, 
              delay: shouldReduceMotion ? 0 : 0.12 * index,
              ease: 'easeOut' 
            }}
            className="flex flex-col items-center justify-center h-24 rounded-[14px]"
            style={{ 
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <tile.icon 
              className="w-6 h-6 mb-2"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <span 
              className="text-[13px]"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {tile.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p 
        className="text-sm text-center mt-5"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        Any signal works. Even none.
      </p>
    </motion.div>
  );
}
