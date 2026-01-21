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
        duration: shouldReduceMotion ? 0 : 0.5, 
        ease: 'easeOut' 
      }}
      className="w-full max-w-[420px] p-7 rounded-2xl glass-card"
    >
      {/* Card Header */}
      <p className="text-[11px] tracking-[0.12em] uppercase text-center mb-5 text-muted-foreground font-medium">
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
              duration: shouldReduceMotion ? 0 : 0.4, 
              delay: shouldReduceMotion ? 0 : 0.12 * index,
              ease: 'easeOut' 
            }}
            className="flex flex-col items-center justify-center h-24 rounded-xl bg-secondary transition-all duration-400 hover:-translate-y-0.5 hover:shadow-md"
          >
            <tile.icon className="w-6 h-6 mb-2 text-foreground/70" />
            <span className="text-[13px] text-foreground">
              {tile.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-sm text-center mt-5 text-muted-foreground">
        Any signal works. Even none.
      </p>
    </motion.div>
  );
}