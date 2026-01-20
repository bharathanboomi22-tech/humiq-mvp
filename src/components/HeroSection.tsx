import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Figma, FileText, FolderOpen, Link2, ArrowRight, Check } from 'lucide-react';
import { LoveLetterModal } from './LoveLetterModal';

interface HeroSectionProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      onSubmit({ githubUrl, otherLinks: '' });
    }
  };

  const isValid = githubUrl.trim() !== '';

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

      {/* Content */}
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

          {/* Center - Love Letters Button (Premium Gradient) */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center px-6 py-3 rounded-full font-medium text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 50%, #7C5CFF 100%)',
              color: '#000000',
              boxShadow: '0 0 24px rgba(124, 92, 255, 0.2)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(124, 92, 255, 0.35)' }}
            whileTap={{ scale: 0.98 }}
          >
            💌 HumIQ Love Letters
          </motion.button>

          {/* Right - Placeholder for future nav */}
          <div className="w-[100px]" />
        </motion.nav>

        {/* Main Content - Vertical Flow */}
        <div className="flex-1 flex flex-col items-start pt-24 lg:pt-32 max-w-[720px]">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
            className="mb-6"
          >
            <p className="text-[11px] text-muted-foreground/60 tracking-wide">
              Early access · Shaping what comes next
            </p>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0.05, ease: 'easeOut' }}
            className="font-display text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.15] tracking-[-0.02em]"
            style={{ color: '#FFFFFF' }}
          >
            The CV era is over.
          </motion.h1>
          
          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.15, ease: 'easeOut' }}
            className="mt-5 text-lg leading-[1.6] max-w-[520px]"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          >
            <p>AI interview invites, without applying to any jobs.</p>
            <p className="mt-2">The first interview is AI. Humans decide from real signal.</p>
          </motion.div>
        </div>

        {/* Horizontal Evaluation Card - Centered Below Hero Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.3, ease: 'easeOut' }}
          className="w-full max-w-[1100px] mx-auto mb-24 lg:mb-32"
        >
          <div 
            className="relative rounded-[20px] p-8 md:p-10"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Card Header */}
            <div className="mb-8">
              <h2 className="font-display text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
                See how you actually work, improve your real work better.
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                HumIQ adapts to the role and the evidence available.
              </p>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* LEFT — Input Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 mb-4">
                    Existing work (optional)
                  </p>
                  
                  {/* Evidence Types Row - Icons Only */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-2.5 rounded-lg bg-white/[0.03]" title="GitHub">
                      <Github className="w-4 h-4 text-foreground/40" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03]" title="Design">
                      <Figma className="w-4 h-4 text-foreground/40" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03]" title="Docs">
                      <FileText className="w-4 h-4 text-foreground/40" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03]" title="Files">
                      <FolderOpen className="w-4 h-4 text-foreground/40" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03]" title="Links">
                      <Link2 className="w-4 h-4 text-foreground/40" />
                    </div>
                  </div>

                  {/* Input Field */}
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="Paste a GitHub PR or repository"
                    className="w-full px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-all duration-200"
                  />
                </div>

                {/* CTA Button */}
                <motion.button
                  type="submit"
                  disabled={!isValid || isLoading}
                  whileHover={isValid && !isLoading ? { y: -1 } : {}}
                  whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-medium disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: isValid && !isLoading 
                      ? 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 50%, #7C5CFF 100%)'
                      : 'rgba(124, 92, 255, 0.15)',
                    color: isValid && !isLoading ? '#000000' : 'rgba(255, 255, 255, 0.5)',
                    boxShadow: isValid && !isLoading 
                      ? '0 0 24px -6px rgba(124, 92, 255, 0.4)' 
                      : 'none',
                  }}
                >
                  {isLoading ? (
                    <span>Evaluating...</span>
                  ) : (
                    <>
                      Evaluate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* RIGHT — What Happens */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-3">
                  {[
                    'Repo is fetched and analyzed automatically',
                    'Ownership and decisions are inferred',
                    'Limits and risks are labeled clearly',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Trust Line */}
            <p className="text-[11px] text-muted-foreground/50 text-center mt-8 leading-relaxed">
              HumIQ evaluates real work evidence. If evidence is limited, it clearly says so.
            </p>
          </div>
        </motion.div>

        {/* Mobile Love Letters Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
          className="md:hidden pb-16 flex justify-center"
        >
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-6 py-3 rounded-full font-medium text-sm"
            style={{
              background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 50%, #7C5CFF 100%)',
              color: '#000000',
              boxShadow: '0 0 24px rgba(124, 92, 255, 0.2)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            💌 HumIQ Love Letters
          </motion.button>
        </motion.div>
      </div>

      {/* Love Letter Modal */}
      <LoveLetterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </section>
  );
}
