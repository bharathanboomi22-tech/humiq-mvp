import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Building2, User, ArrowRight } from 'lucide-react';
import { CandidateInputForm } from './CandidateInputForm';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.9)' }}
          src="/videos/hero-bg.mp4"
        />
        
        {/* Subtle dark overlay for text readability */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.55) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <motion.nav
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="pt-8 lg:pt-12 flex items-center justify-between"
        >
          {/* Left - Logo + Beta */}
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              HumIQ
            </span>
            <span 
              className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-medium rounded-full border"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Beta
            </span>
          </div>

          {/* Center - Love Letters Button */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
            whileHover={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            💌 Love Letters
          </motion.button>

          {/* Right - Placeholder for future nav */}
          <div className="w-[80px]" />
        </motion.nav>

        {/* Main Content - Centered Hero */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          {/* Hero Text - Centered */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Tagline */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-sm md:text-base font-medium tracking-wide mb-6"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              AI-Powered Talent Assessment
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-[-0.03em] text-white"
            >
              The CV era is over.
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-6 text-lg md:text-xl leading-relaxed max-w-xl mx-auto"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Get AI interview invites without applying. Let your work speak for itself.
            </motion.p>
          </div>

          {/* Product Module - Centered */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg"
          >
            <ProductInputModule onSubmit={onSubmit} isLoading={isLoading} />
          </motion.div>
        </div>

        {/* Mobile Love Letters Button */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1, ease: 'easeOut' }}
          className="md:hidden pb-12 flex justify-center"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-5 py-2.5 rounded-full font-medium text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            💌 Love Letters
          </button>
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

/* Product Input Module */
interface ProductInputModuleProps {
  onSubmit: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

function ProductInputModule({ onSubmit, isLoading }: ProductInputModuleProps) {
  const navigate = useNavigate();
  const { setUserType } = useAuth();

  const handleCompanyClick = () => {
    setUserType('company');
    navigate('/company/setup');
  };

  const handleTalentClick = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div className="w-full space-y-4">
      {/* User Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCompanyClick}
          className="p-4 text-left group rounded-xl transition-all duration-300 hover:scale-[1.02]"
          style={cardStyle}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Building2 className="w-5 h-5 text-white/80" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-medium text-white text-sm">I'm Hiring</h3>
          <p className="text-xs text-white/50 mt-0.5">Find matched talent</p>
        </button>

        <button
          onClick={handleTalentClick}
          className="p-4 text-left group rounded-xl transition-all duration-300 hover:scale-[1.02]"
          style={cardStyle}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <User className="w-5 h-5 text-white/80" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-medium text-white text-sm">I'm a Talent</h3>
          <p className="text-xs text-white/50 mt-0.5">Create your profile</p>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">or take an assessment</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Talent Assessment Form */}
      <div 
        className="p-6 md:p-8 rounded-2xl"
        style={cardStyle}
      >
        <CandidateInputForm onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
