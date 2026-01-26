import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, Variants, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';
import { AIDialogueCard } from './hero/AIDialogueCard';
import { AIOrb } from './hero/AIOrb';
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
    <section className="min-h-screen relative overflow-hidden">
      {/* Flowing Gradient Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: activeTab === 'talent' 
            ? `linear-gradient(135deg, 
                hsl(200, 100%, 97%) 0%, 
                hsl(320, 80%, 92%) 25%, 
                hsl(280, 70%, 88%) 50%, 
                hsl(250, 80%, 85%) 75%, 
                hsl(220, 90%, 88%) 100%
              )`
            : `linear-gradient(135deg, 
                hsl(220, 90%, 97%) 0%, 
                hsl(240, 80%, 94%) 25%, 
                hsl(260, 70%, 92%) 50%, 
                hsl(220, 80%, 90%) 75%, 
                hsl(200, 90%, 95%) 100%
              )`,
          transition: 'background 0.6s ease-in-out',
        }}
      />
      
      {/* Subtle overlaying gradient layers for depth */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 0% 40%, hsl(200, 100%, 97%) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 100% 30%, hsl(240, 80%, 88%) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 50%, hsl(300, 60%, 90%) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Enhanced AI Orb with stronger visibility */}
      <div className="absolute inset-0 lg:left-[30%] pointer-events-none">
        {/* Radial glow behind orb for contrast */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
          }}
        />
        {/* Outer glow ring */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[550px] lg:h-[550px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(91, 140, 255, 0.15) 70%, transparent 90%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <AIOrb />
      </div>

      {/* Navigation Bar */}
      <motion.header
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 w-full backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.4)' }}
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
                HumiQ
              </span>
            </button>

            {/* Center - Love Letters Button with Glow Animation */}
            <motion.button
              onClick={() => navigate('/love-letter')}
              className="hidden md:flex flex-col items-center gap-0.5 group relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 143, 177, 0.3), 0 0 40px rgba(185, 131, 255, 0.2)',
                  '0 0 30px rgba(255, 143, 177, 0.5), 0 0 60px rgba(185, 131, 255, 0.3)',
                  '0 0 20px rgba(255, 143, 177, 0.3), 0 0 40px rgba(185, 131, 255, 0.2)',
                ],
              }}
              style={{ borderRadius: '9999px' }}
            >
              <span 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #FF8FB1 0%, #B983FF 50%, #5B8CFF 100%)',
                  color: '#FFFFFF',
                }}
              >
                {/* Shimmer effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <Heart className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Love Letters</span>
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
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}
            >
              <button
                onClick={() => handleTabSwitch('talent')}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: activeTab === 'talent' ? '#0B0B0D' : 'transparent',
                  color: activeTab === 'talent' ? '#FFFFFF' : '#0B0B0D',
                }}
              >
                Talent
              </button>
              <button
                onClick={() => handleTabSwitch('company')}
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
                  {/* Headline */}
                  <motion.h1 
                    className="font-display text-[38px] sm:text-[46px] md:text-[52px] lg:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ color: '#0B0B0D' }}
                    variants={lineVariants}
                  >
                    CVs are history.
                    <br />
                    Decisions are the future.
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-lg md:text-xl max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.6]"
                    style={{ color: '#4A4A4A' }}
                    variants={lineVariants}
                  >
                    HumiQ AI understands how you think, decide, and solve — through real conversations and real work.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    variants={lineVariants}
                  >
                    {/* Primary CTA - Active Intelligence Gradient with Enhanced Glow */}
                    <motion.button
                      onClick={handleTalentClick}
                      className="relative px-8 py-4 rounded-full text-base font-semibold text-white overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #5B8CFF 0%, #8F7CFF 35%, #B983FF 65%, #FF8FB1 100%)',
                        boxShadow: '0 0 20px rgba(91, 140, 255, 0.4), 0 0 40px rgba(185, 131, 255, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                      }}
                      whileHover={shouldReduceMotion ? {} : { 
                        scale: 1.03,
                        boxShadow: '0 0 30px rgba(91, 140, 255, 0.5), 0 0 60px rgba(185, 131, 255, 0.3), 0 8px 24px rgba(0,0,0,0.15)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      animate={shouldReduceMotion ? {} : {
                        boxShadow: [
                          '0 0 20px rgba(91, 140, 255, 0.4), 0 0 40px rgba(185, 131, 255, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                          '0 0 28px rgba(91, 140, 255, 0.5), 0 0 50px rgba(185, 131, 255, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
                          '0 0 20px rgba(91, 140, 255, 0.4), 0 0 40px rgba(185, 131, 255, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                        ],
                      }}
                      transition={{
                        boxShadow: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      Start with real work →
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
                      See how HumiQ thinks
                      <span 
                        className="absolute bottom-1 left-4 right-4 h-[1px] origin-left scale-x-0 transition-transform duration-300 delay-75 group-hover:scale-x-100"
                        style={{ background: '#0B0B0D' }}
                      />
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
                  {/* Headline */}
                  <motion.h1 
                    className="font-display text-[38px] sm:text-[46px] md:text-[52px] lg:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ color: '#0B0B0D' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    Decisions,
                    <br />
                    not resumes.
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    className="text-lg md:text-xl max-w-lg mx-auto lg:mx-0 mb-8 leading-[1.6]"
                    style={{ color: '#4A4A4A' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    No job posts. No CVs. AI runs the first interviews.
                    <br />
                    You get decision-ready talent in hours, not weeks.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {/* Primary CTA - Bold Company Gradient */}
                    <motion.button
                      onClick={handleCompanyClick}
                      className="relative px-8 py-4 rounded-full text-base font-semibold text-white overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                      }}
                      whileHover={shouldReduceMotion ? {} : { 
                        scale: 1.03,
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 8px 24px rgba(0,0,0,0.15)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      animate={shouldReduceMotion ? {} : {
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                          '0 0 28px rgba(59, 130, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
                          '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0,0,0,0.1)',
                        ],
                      }}
                      transition={{
                        boxShadow: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      Start Hiring Instantly
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
                      See how it works
                      <span 
                        className="absolute bottom-1 left-4 right-4 h-[1px] origin-left scale-x-0 transition-transform duration-300 delay-75 group-hover:scale-x-100"
                        style={{ background: '#0B0B0D' }}
                      />
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

      {/* Mobile Love Letters Button */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
        className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center z-20"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-md"
          style={{ 
            background: 'rgba(255,255,255,0.85)',
            color: '#0B0B0D',
            backdropFilter: 'blur(8px)',
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
