import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateInputForm } from './CandidateInputForm';
import { LoveLetters, LoveLettersRef } from './LoveLetters';

interface HeroSectionProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const loveLettersRef = useRef<LoveLettersRef>(null);

  const scrollToLoveLetters = () => {
    const element = document.getElementById('love-letters-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Expand the input after scrolling
      setTimeout(() => {
        loveLettersRef.current?.expand();
      }, 500);
    }
  };

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
      <div className="relative z-10 container mx-auto px-6 lg:px-12 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="pt-8 lg:pt-12 flex items-center justify-between"
        >
          {/* Left - Logo + Beta */}
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-medium tracking-tight text-foreground/90">
              HumIQ <span className="text-foreground/50">AI</span>
            </span>
            <span 
              className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.55)',
              }}
            >
              Beta
            </span>
          </div>

          {/* Center - Love Letters Nav Item */}
          <button
            onClick={scrollToLoveLetters}
            className="hidden md:block text-sm text-muted-foreground hover:text-foreground/80 
              transition-all duration-200 hover:opacity-100 opacity-70"
          >
            💌 HumIQ Love Letters
          </button>

          {/* Right - Placeholder for future nav */}
          <div className="w-[100px]" />
        </motion.nav>

        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full py-16 lg:py-0">
            
            {/* LEFT COLUMN - Editorial text + Beta indicator */}
            <div className="flex flex-col justify-center">
              {/* Beta Microline - Top of content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="mb-6"
              >
                <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                  Early access · Shaping what comes next
                </p>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="font-display text-[2rem] md:text-[2.75rem] lg:text-[3rem] font-medium leading-[1.2] tracking-[-0.02em] text-foreground"
              >
                Hiring — without resumes or screening.
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
                className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-[50ch]"
              >
                HumIQ evaluates real work, runs the first interview with AI, and sends companies only decision-ready candidates.
              </motion.p>
              
              {/* Supporting microcopy */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.9, ease: 'easeOut' }}
                className="mt-5 text-sm text-muted-foreground/60 tracking-wide"
              >
                No applications. No optimized CVs. No guesswork.
              </motion.p>
            </div>

            {/* RIGHT COLUMN - Product module */}
            <div className="flex flex-col items-center justify-center lg:items-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.8, ease: 'easeOut' }}
                className="w-full max-w-md"
              >
                <ProductInputModule onSubmit={onSubmit} isLoading={isLoading} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Love Letters Section - Center bottom of hero */}
        <motion.div
          id="love-letters-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
          className="pb-16 lg:pb-24 flex flex-col items-center"
        >
          <LoveLetters ref={loveLettersRef} showButton={true} />
        </motion.div>
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
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-4">
      {/* User Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/auth/login')}
          className="glass-card p-4 text-left group hover:border-accent/40 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-medium text-foreground text-sm">I'm Hiring</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Find matched talent</p>
        </button>

        <button
          onClick={() => navigate('/auth/login')}
          className="glass-card p-4 text-left group hover:border-accent/40 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <User className="w-5 h-5 text-accent" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-medium text-foreground text-sm">I'm a Talent</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Create your profile</p>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground">or take an assessment</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Talent Assessment Form */}
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
    </div>
  );
}
