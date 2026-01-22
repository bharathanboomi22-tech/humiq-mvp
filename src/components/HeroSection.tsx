import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Heart } from 'lucide-react';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';
import { AICareerCard } from './hero/AICareerCard';
import { AIOrb } from './hero/AIOrb';

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

  // Animation variants for staggered text reveal
  const headlineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section 
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      {/* AI Orb - positioned on right side for desktop */}
      <div className="absolute inset-0 lg:left-[30%]">
        <AIOrb />
      </div>

      {/* Navigation Bar */}
      <motion.header
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 w-full"
      >
        <div className="container max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center transition-opacity duration-300 hover:opacity-70"
            >
              <span 
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: '#0B0B0D' }}
              >
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
              <span 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group-hover:shadow-md"
                style={{ 
                  background: '#F7F7F8',
                  color: '#0B0B0D',
                }}
              >
                <Heart className="w-4 h-4" />
                Send Love Letters
              </span>
              <span 
                className="text-[11px]"
                style={{ color: '#5F6368' }}
              >
                If you love the product
              </span>
            </motion.button>

            {/* Right - Toggle Buttons */}
            <div 
              className="flex items-center rounded-full p-1"
              style={{ background: '#F7F7F8' }}
            >
              <button
                onClick={handleTalentClick}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: activeTab === 'talent' ? '#0B0B0D' : 'transparent',
                  color: activeTab === 'talent' ? '#FFFFFF' : '#0B0B0D',
                }}
              >
                Talent
              </button>
              <button
                onClick={handleCompanyClick}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: activeTab === 'company' ? '#0B0B0D' : 'transparent',
                  color: activeTab === 'company' ? '#FFFFFF' : '#0B0B0D',
                }}
              >
                Company
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex items-center min-h-[calc(100vh-100px)]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
          
          {/* Mobile: AI Card first */}
          <div className="lg:hidden order-1">
            <AICareerCard />
          </div>

          {/* Left Column - Narrative Content */}
          <motion.div
            className="text-center lg:text-left order-2 lg:order-1"
            variants={headlineVariants}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            {/* Headline */}
            <motion.h1 
              className="font-display text-4xl sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em] mb-6"
              style={{ color: '#0B0B0D' }}
              variants={lineVariants}
            >
              CVs are history.
              <br />
              Decisions are the future.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl max-w-lg mx-auto lg:mx-0 mb-5 leading-relaxed"
              style={{ color: '#5F6368' }}
              variants={lineVariants}
            >
              HumIQ learns how you think, decide, and execute — using real work, not resumes.
            </motion.p>

            {/* Micro-proof */}
            <motion.p
              className="text-sm mb-8"
              style={{ color: '#5F6368', opacity: 0.8 }}
              variants={lineVariants}
            >
              Used by teams that hire for ownership, not keywords.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
              variants={lineVariants}
            >
              {/* Primary CTA */}
              <motion.button
                onClick={handleTalentClick}
                className="px-7 py-3.5 rounded-full text-base font-medium transition-all duration-300"
                style={{ 
                  background: '#0B0B0D',
                  color: '#FFFFFF',
                }}
                whileHover={shouldReduceMotion ? {} : { 
                  scale: 1.02,
                  boxShadow: '0 8px 24px -8px rgba(11, 11, 13, 0.35)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Start with Real Work →
              </motion.button>

              {/* Secondary CTA */}
              <motion.button
                onClick={() => {
                  const section = document.getElementById('how-it-works');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative px-4 py-2 text-base font-medium group"
                style={{ color: '#0B0B0D' }}
                whileHover={{ scale: 1.01 }}
              >
                See how HumIQ thinks
                <span 
                  className="absolute bottom-1 left-4 right-4 h-[1px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: '#0B0B0D' }}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Column - AI Card (Desktop) */}
          <div className="hidden lg:block order-2">
            <AICareerCard />
          </div>
        </div>
      </div>

      {/* Mobile Love Letters Button */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
        className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center z-20"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm"
          style={{ 
            background: '#F7F7F8',
            color: '#0B0B0D',
          }}
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
