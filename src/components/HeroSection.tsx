import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants, AnimatePresence } from 'framer-motion';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';
import { AIDialogueCard } from './hero/AIDialogueCard';
import { CompanyDecisionPanel } from './hero/CompanyDecisionPanel';

interface HeroSectionProps {
  onSubmit?: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
  onViewChange?: (view: 'talent' | 'company') => void;
}

export function HeroSection({ onSubmit, isLoading, onViewChange }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setUserType } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'talent' | 'company'>('talent');

  const handleTabSwitch = (tab: 'talent' | 'company') => {
    setActiveTab(tab);
    onViewChange?.(tab);
  };

  const handleTalentClick = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  const handleCompanyClick = () => {
    setUserType('company');
    navigate('/company/onboarding');
  };

  // Animation variants
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

  const contentVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-white">
      {/* Navigation Bar */}
      <motion.header
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 w-full bg-white"
      >
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-premium border border-gray-100">
            {/* Left - Logo */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 transition-opacity duration-300 hover:opacity-70"
              >
                <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                  HumiQ
                </span>
              </button>
            </div>

            {/* Center - Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => handleTabSwitch('talent')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'talent' 
                    ? 'bg-white text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Talent
              </button>
              <button
                onClick={() => handleTabSwitch('company')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'company' 
                    ? 'bg-white text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hiring
              </button>
            </div>

            {/* Right - CTAs */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleTalentClick}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 55%, #FF6BD6 100%)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a Candidate
              </motion.button>
              <motion.button
                onClick={handleCompanyClick}
                className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 55%, #FF6BD6 100%)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a Company
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex items-center min-h-[calc(100vh-100px)]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
          
          <AnimatePresence mode="wait">
            {activeTab === 'talent' ? (
              <>
                {/* Mobile: AI Dialogue Card first */}
                <motion.div 
                  key="talent-mobile-card"
                  className="lg:hidden order-1"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <AIDialogueCard />
                </motion.div>

                {/* Left Column - Talent Narrative Content */}
                <motion.div
                  key="talent-content"
                  className="text-center lg:text-left order-2 lg:order-1"
                  variants={headlineVariants}
                  initial={shouldReduceMotion ? "visible" : "hidden"}
                  animate="visible"
                  exit="exit"
                >
                  {/* Headline with gradient */}
                  <motion.h1 
                    className="font-display text-[40px] sm:text-[48px] md:text-[54px] lg:text-[56px] font-extrabold leading-[1.05] tracking-[-0.02em] mb-6"
                    variants={lineVariants}
                  >
                    <span className="text-gradient">CVs are history.</span>
                    <br />
                    <span className="text-gradient">Decisions</span>{' '}
                    <span className="text-foreground">are future.</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.7] text-muted-foreground"
                    variants={lineVariants}
                  >
                    HumiQ AI understands how you think, decide, and solve — through real conversations and real work.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    variants={lineVariants}
                  >
                    <motion.button
                      onClick={handleTalentClick}
                      className="px-8 py-4 rounded-full text-base font-bold text-white animate-pulse-glow"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 55%, #FF6BD6 100%)',
                      }}
                      whileHover={{ 
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start Now
                    </motion.button>
                    <button 
                      onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-link-pink text-base"
                    >
                      How it works →
                    </button>
                  </motion.div>
                </motion.div>

                {/* Right Column - AI Dialogue Card (Desktop) */}
                <motion.div 
                  key="talent-desktop-card"
                  className="hidden lg:block order-2"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <AIDialogueCard />
                </motion.div>
              </>
            ) : (
              <>
                {/* Mobile: Company Decision Panel first */}
                <motion.div 
                  key="company-mobile-card"
                  className="lg:hidden order-1"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CompanyDecisionPanel />
                </motion.div>

                {/* Left Column - Company Narrative Content */}
                <motion.div
                  key="company-content"
                  className="text-center lg:text-left order-2 lg:order-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Headline with gradient */}
                  <motion.h1 
                    className="font-display text-[40px] sm:text-[48px] md:text-[54px] lg:text-[56px] font-extrabold leading-[1.05] tracking-[-0.02em] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <span className="text-gradient">Decisions,</span>
                    <br />
                    <span className="text-foreground">not resumes.</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.7] text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    No job posts. No CVs. AI runs the first interviews.
                    You get decision-ready talent in hours, not weeks.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.button
                      onClick={handleCompanyClick}
                      className="px-8 py-4 rounded-full text-base font-bold text-white animate-pulse-glow"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 55%, #FF6BD6 100%)',
                      }}
                      whileHover={{ 
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start Hiring Instantly
                    </motion.button>
                    <button 
                      onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-link-pink text-base"
                    >
                      How it works →
                    </button>
                  </motion.div>
                </motion.div>

                {/* Right Column - Company Decision Panel (Desktop) */}
                <motion.div 
                  key="company-desktop-card"
                  className="hidden lg:block order-2"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CompanyDecisionPanel />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile toggle */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
        className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center z-20 px-4"
      >
        <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-lg border border-gray-100">
          <button
            onClick={() => handleTabSwitch('talent')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'talent' 
                ? 'bg-gray-100 text-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            Talent
          </button>
          <button
            onClick={() => handleTabSwitch('company')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'company' 
                ? 'bg-gray-100 text-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            Hiring
          </button>
        </div>
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