import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';
import { AICareerCard } from './hero/AICareerCard';

interface HeroSectionProps {
  onSubmit?: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setUserType } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'talent' | 'company'>('talent');

  const handleTalentClick = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  const handleCompanyClick = () => {
    setUserType('company');
    navigate('/company/setup');
  };

  return (
    <section 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 42%, rgba(255, 183, 214, 0.35) 0%, rgba(255, 214, 232, 0.18) 40%, transparent 70%),
          linear-gradient(to right, #F3EEF1 0%, #FAFAFA 20%, #FAFAFA 80%, #F2EDEB 100%)
        `,
      }}
    >
      {/* Orbi AI Animation - Hero Only */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-5%' }}>
        {/* Main Orbi - subtle center glow */}
        <motion.div
          className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 140, 190, 0.18) 0%, rgba(255, 200, 225, 0.08) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          initial={shouldReduceMotion ? { opacity: 0.15 } : { opacity: 0, scale: 0.9 }}
          animate={shouldReduceMotion ? { opacity: 0.15 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        
        {/* Floating Orbi elements - only if motion allowed */}
        {!shouldReduceMotion && (
          <>
            {/* Left drift orb */}
            <motion.div
              className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 200, 225, 0.12) 0%, transparent 60%)',
                filter: 'blur(60px)',
                top: '25%',
                left: '12%',
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0.6, 0.8],
                x: [0, 15, -10, 0],
                y: [0, -10, 5, 0],
              }}
              transition={{ 
                duration: 18, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 0.5 
              }}
            />
            
            {/* Right drift orb */}
            <motion.div
              className="absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 140, 190, 0.10) 0%, transparent 60%)',
                filter: 'blur(70px)',
                bottom: '30%',
                right: '8%',
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0.5, 0.7],
                x: [0, -12, 8, 0],
                y: [0, 8, -6, 0],
              }}
              transition={{ 
                duration: 22, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 1 
              }}
            />

            {/* Center pulse orb */}
            <motion.div
              className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 200, 225, 0.10) 0%, transparent 50%)',
                filter: 'blur(100px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0.4, 0.6],
                scale: [1, 1.05, 0.98, 1],
              }}
              transition={{ 
                duration: 16, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 0.8 
              }}
            />
          </>
        )}
      </div>

      {/* Navigation Bar */}
      <motion.header
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 w-full"
      >
        <div className="container max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-foreground hover:opacity-80 transition-opacity duration-400"
            >
              <span className="font-display text-xl font-bold tracking-tight">
                HumIQ
              </span>
            </button>

            {/* Center - Love Letters Button */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex flex-col items-center gap-0.5 group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-foreground text-sm font-medium transition-all duration-400 group-hover:shadow-md">
                <Heart className="w-4 h-4" />
                Send Love Letters
              </span>
              <span className="text-[11px] text-muted-foreground">
                If you love the product
              </span>
            </motion.button>

            {/* Right - Toggle Buttons */}
            <div className="flex items-center bg-card rounded-full p-1 shadow-sm">
              <button
                onClick={handleTalentClick}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-400 ${
                  activeTab === 'talent'
                    ? 'bg-foreground text-background'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                Talent
              </button>
              <button
                onClick={handleCompanyClick}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-400 ${
                  activeTab === 'company'
                    ? 'bg-foreground text-background'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                Company
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex items-center min-h-[calc(100vh-120px)]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center py-12 lg:py-0">
          {/* Left Column - Static Content (60%) */}
          <motion.div
            className="lg:col-span-3 text-center lg:text-left"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6">
              CVs are history.
              <br />
              Decisions are the future.
            </h1>

            {/* Subheadline */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6"
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              HumIQ evaluates how people think, decide, and execute — using real work, not resumes.
            </motion.p>

            {/* Micro-proof */}
            <motion.p
              className="text-xs sm:text-sm text-muted-foreground/70"
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Used by teams that hire for ownership, not keywords.
            </motion.p>
          </motion.div>

          {/* Right Column - AI Career Card (40%) */}
          <div className="lg:col-span-2">
            <AICareerCard />
          </div>
        </div>
      </div>

      {/* Mobile Love Letters Button */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1, ease: 'easeOut' }}
        className="md:hidden absolute bottom-8 left-0 right-0 flex justify-center z-20"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-foreground text-sm font-medium shadow-sm"
        >
          <Heart className="w-4 h-4" />
          Love Letters
        </button>
      </motion.div>

      {/* Love Letter Modal */}
      <LoveLetterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </section>
  );
}