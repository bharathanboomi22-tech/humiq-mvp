import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
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
        className="relative z-20 w-full bg-white border-b border-gray-100"
      >
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 transition-opacity duration-300 hover:opacity-70"
              >
                <span className="font-display text-xl font-bold tracking-tight text-foreground">
                  HumiQ
                </span>
                <span className="text-xs font-medium text-pink-vibrant px-1.5 py-0.5 rounded bg-pink-wash">
                  Beta
                </span>
              </button>
              
              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-5">
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </a>
              </nav>
            </div>

            {/* Center - Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <span className={`text-sm ${activeTab === 'talent' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Talent
              </span>
              <button
                onClick={() => handleTabSwitch(activeTab === 'talent' ? 'company' : 'talent')}
                className="relative w-12 h-6 rounded-full bg-pink-vibrant transition-colors"
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  animate={{ left: activeTab === 'talent' ? 4 : 28 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm ${activeTab === 'company' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Hiring
              </span>
            </div>

            {/* Right - CTAs */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleTalentClick}
                className="px-4 py-2 rounded-full text-sm font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #E91E8C 0%, #C71585 100%)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a candidate
              </motion.button>
              <button
                onClick={handleCompanyClick}
                className="hidden sm:block text-sm font-medium text-pink-vibrant hover:underline"
              >
                Sign up as a Company
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex items-center min-h-[calc(100vh-80px)]">
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
                  {/* Headline with pink gradient */}
                  <motion.h1 
                    className="font-display text-[38px] sm:text-[46px] md:text-[52px] lg:text-[56px] font-bold leading-[1.08] tracking-[-0.02em] mb-6"
                    variants={lineVariants}
                  >
                    <span className="text-gradient-pink">CVs are history.</span>
                    <br />
                    <span className="text-gradient-pink">Decisions</span>{' '}
                    <span className="text-foreground">are future.</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.6] text-muted-foreground"
                    variants={lineVariants}
                  >
                    HumiQ AI understands how you think, decide, and solve through real conversations and real work.
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    variants={lineVariants}
                  >
                    <motion.button
                      onClick={handleTalentClick}
                      className="px-8 py-4 rounded-full text-base font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #E91E8C 0%, #C71585 100%)',
                        boxShadow: '0 4px 20px rgba(233, 30, 140, 0.4)',
                      }}
                      whileHover={{ 
                        boxShadow: '0 8px 32px rgba(233, 30, 140, 0.5)',
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start Now
                    </motion.button>
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
                  {/* Headline with pink gradient */}
                  <motion.h1 
                    className="font-display text-[38px] sm:text-[46px] md:text-[52px] lg:text-[56px] font-bold leading-[1.08] tracking-[-0.02em] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <span className="text-gradient-pink">Decisions,</span>
                    <br />
                    <span className="text-foreground">not resumes.</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.6] text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    No job posts. No CVs. AI runs the first interviews.
                    You get decision-ready talent in hours, not weeks.
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.button
                      onClick={handleCompanyClick}
                      className="px-8 py-4 rounded-full text-base font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #E91E8C 0%, #C71585 100%)',
                        boxShadow: '0 4px 20px rgba(233, 30, 140, 0.4)',
                      }}
                      whileHover={{ 
                        boxShadow: '0 8px 32px rgba(233, 30, 140, 0.5)',
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start Now
                    </motion.button>
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

      {/* Mobile toggle and Love Letters Button */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
        className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20 px-4"
      >
        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-gray-100">
          <span className={`text-xs ${activeTab === 'talent' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Talent
          </span>
          <button
            onClick={() => handleTabSwitch(activeTab === 'talent' ? 'company' : 'talent')}
            className="relative w-10 h-5 rounded-full bg-pink-vibrant"
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: activeTab === 'talent' ? 2 : 22 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-xs ${activeTab === 'company' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Hiring
          </span>
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