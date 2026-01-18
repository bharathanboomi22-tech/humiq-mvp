import { motion, useReducedMotion } from 'framer-motion';
import { CandidateInputForm } from './CandidateInputForm';

interface HeroSectionProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background - warm matte black with subtle radial depth */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'radial-gradient(ellipse 120% 80% at 30% 50%, #0D1117 0%, #0B0E12 50%, #090B0E 100%)'
        }}
      />
      
      {/* Layer C — Grain / Noise overlay (full width, static) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Layer B — Static Intelligence Glow behind headline (always visible) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: 'inset(0 45% 0 0)' }}
      >
        <div
          className="absolute left-[8%] top-[20%] w-[40%] h-[55%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(56, 189, 248, 0.25), transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Intelligence Blur — LEFT SIDE ONLY (clipped to ~55%) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0 45% 0 0)' }}
      >
        {/* Layer A — Drift Blobs (3 large radial gradient blobs) */}
        
        {/* Blob 1 - Upper left, cyan-teal */}
        <motion.div
          className="absolute left-[5%] top-[8%] w-[35%] h-[35%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(34, 211, 238, 0.4), transparent 60%)',
            filter: 'blur(40px)',
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 50, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob 2 - Center, soft blue */}
        <motion.div
          className="absolute left-[18%] top-[30%] w-[32%] h-[32%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(99, 179, 237, 0.35), transparent 55%)',
            filter: 'blur(35px)',
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, -35, 30, 0],
            y: [0, 40, -15, 0],
            scale: [1, 0.9, 1.08, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        
        {/* Blob 3 - Lower, teal accent */}
        <motion.div
          className="absolute left-[8%] top-[50%] w-[30%] h-[35%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(45, 212, 191, 0.35), transparent 55%)',
            filter: 'blur(45px)',
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 40, -25, 0],
            y: [0, -25, 35, 0],
            scale: [1, 1.12, 0.92, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
        />
      </div>

      {/* Content grid - two columns */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 w-full py-16 lg:py-0">
          
          {/* LEFT COLUMN - Editorial text */}
          <div className="flex flex-col justify-center">
            {/* Title - Line 1 */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="font-display text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-medium leading-[1.1] tracking-[-0.03em] text-foreground"
            >
              The CV era is over.
            </motion.h1>
            
            {/* Title - Line 2 */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
              className="font-display text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-medium leading-[1.1] tracking-[-0.03em] text-foreground mt-2"
            >
              HumIQ is building what comes next.
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0, ease: 'easeOut' }}
              className="mt-8 text-lg md:text-xl text-foreground/70 leading-relaxed max-w-[50ch]"
            >
              HumIQ replaces CVs with real work evidence — so hiring starts with how someone actually works.
            </motion.p>
            
            {/* Microline - philosophical boundary */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 1.4, ease: 'easeOut' }}
              className="mt-8 text-sm text-muted-foreground tracking-wide"
            >
              No optimized CVs. No ATS. No job marketplace.
            </motion.p>
          </div>

          {/* RIGHT COLUMN - Product module with title */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.8, ease: 'easeOut' }}
              className="w-full max-w-md"
            >
              {/* Editorial title above card */}
              <h2 className="font-display text-xl md:text-2xl font-medium leading-relaxed tracking-[-0.01em] text-foreground/85 mb-8 text-center">
                See how people actually work, before you hire them.
              </h2>
              
              <ProductInputModule onSubmit={onSubmit} isLoading={isLoading} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Product Input Module - refined glass card with the form */
interface ProductInputModuleProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

function ProductInputModule({ onSubmit, isLoading }: ProductInputModuleProps) {
  return (
    <div className="glass-card p-6 md:p-8 relative">
      {/* Slight elevation glow */}
      <div 
        className="absolute inset-0 -z-10 rounded-2xl opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(124, 92, 255, 0.08), transparent)',
        }}
      />
      
      <CandidateInputForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
