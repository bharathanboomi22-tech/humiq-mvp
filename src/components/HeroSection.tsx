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
          className="absolute left-[5%] top-[25%] w-[45%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(70, 130, 140, 0.35), transparent 60%)',
            filter: 'blur(140px)',
            opacity: 0.06,
          }}
        />
      </div>

      {/* Intelligence Blur — LEFT SIDE ONLY (clipped to ~55%) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0 45% 0 0)' }}
      >
        {/* Layer A — Drift Blobs (3 large radial gradient blobs) */}
        
        {/* Blob 1 - Upper left, muted teal */}
        <motion.div
          className="absolute left-[2%] top-[10%] w-[40%] h-[40%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(55, 120, 130, 0.7), transparent 55%)',
            filter: 'blur(60px)',
          }}
          initial={{ opacity: 0.1 }}
          animate={shouldReduceMotion ? { opacity: 0.08 } : {
            x: [0, 35, 10, 0],
            y: [0, 20, -15, 0],
            scale: [1, 1.06, 0.97, 1],
            opacity: [0.1, 0.09, 0.07, 0.06, 0.08, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Blob 2 - Center, cyan-gray */}
        <motion.div
          className="absolute left-[15%] top-[35%] w-[35%] h-[35%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(75, 135, 145, 0.65), transparent 50%)',
            filter: 'blur(55px)',
          }}
          initial={{ opacity: 0.11 }}
          animate={shouldReduceMotion ? { opacity: 0.07 } : {
            x: [0, -25, 20, 0],
            y: [0, 30, -10, 0],
            scale: [1, 0.94, 1.05, 1],
            opacity: [0.11, 0.08, 0.06, 0.07, 0.09, 0.11],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        
        {/* Blob 3 - Lower left, soft teal */}
        <motion.div
          className="absolute left-[5%] top-[55%] w-[38%] h-[38%]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(60, 125, 135, 0.6), transparent 55%)',
            filter: 'blur(65px)',
          }}
          initial={{ opacity: 0.09 }}
          animate={shouldReduceMotion ? { opacity: 0.06 } : {
            x: [0, 30, -15, 0],
            y: [0, -18, 25, 0],
            scale: [1, 1.08, 0.95, 1],
            opacity: [0.09, 0.07, 0.06, 0.065, 0.08, 0.09],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8,
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
                See how candidates actually work, before you hire them.
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
