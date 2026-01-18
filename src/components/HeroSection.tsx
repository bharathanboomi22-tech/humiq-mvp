import { motion } from 'framer-motion';
import { CandidateInputForm } from './CandidateInputForm';

interface HeroSectionProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background - warm matte black #0B0E12 */}
      <div 
        className="absolute inset-0"
        style={{ background: '#0B0E12' }}
      />
      
      {/* Subtle ambient animation - LEFT SIDE ONLY */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -left-[20%] top-[10%] w-[60%] h-[70%] opacity-[0.04]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(124, 92, 255, 0.6), transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute left-[5%] top-[40%] w-[40%] h-[50%] opacity-[0.03]"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at center, rgba(51, 214, 166, 0.5), transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, -30, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
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

          {/* RIGHT COLUMN - Product module */}
          <div className="flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
              className="w-full max-w-md"
            >
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
