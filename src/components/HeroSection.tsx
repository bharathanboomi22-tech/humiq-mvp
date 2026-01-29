import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AIOrbi } from './hero/AIOrbi';
import { Heart } from 'lucide-react';

interface HeroSectionProps {
  onSubmit?: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
  onViewChange?: (view: 'talent' | 'company') => void;
}

// Dialogue lines with sequential reveal
const talentDialogueLines = [
  "I'm not here to read your CV.",
  "I'm interested in how you think, decide, and solve — in real situations.",
  "No keywords. No applications.",
  "Show me something you've worked on.",
  "It doesn't have to be perfect. Just real.",
];

const companyDialogueLines = [
  "I'm not here to collect resumes.",
  "I want to understand who can actually do the work you need.",
  "No job boards. No screening.",
  "Define the outcomes. I'll find the right people.",
  "Let evidence drive your decisions.",
];

export function HeroSection({ onSubmit, isLoading, onViewChange }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setUserType } = useAuth();
  
  // Get mode from URL or default to 'talent'
  const urlMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState<'talent' | 'company'>(
    urlMode === 'hiring' ? 'company' : 'talent'
  );
  
  // Sequential dialogue state
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isWriting, setIsWriting] = useState(false);

  // Update URL when tab changes
  const handleTabSwitch = useCallback((tab: 'talent' | 'company') => {
    setActiveTab(tab);
    setSearchParams({ mode: tab === 'company' ? 'hiring' : 'talent' });
    onViewChange?.(tab);
    // Reset dialogue animation
    setVisibleLines(0);
    setIsWriting(false);
  }, [setSearchParams, onViewChange]);

  // Sequential dialogue reveal
  useEffect(() => {
    const dialogueLines = activeTab === 'talent' ? talentDialogueLines : companyDialogueLines;
    
    if (visibleLines < dialogueLines.length) {
      setIsWriting(true);
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
        if (visibleLines === dialogueLines.length - 1) {
          setIsWriting(false);
        }
      }, shouldReduceMotion ? 0 : 600);
      return () => clearTimeout(timer);
    } else {
      setIsWriting(false);
    }
  }, [visibleLines, activeTab, shouldReduceMotion]);

  // Initial reveal on mount
  useEffect(() => {
    if (visibleLines === 0) {
      const timer = setTimeout(() => setVisibleLines(1), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTalentClick = () => {
    setUserType('talent');
    navigate('/talent/onboarding');
  };

  const handleCompanyClick = () => {
    setUserType('company');
    navigate('/company/onboarding');
  };

  const scrollToLoveLetters = () => {
    document.getElementById('loveletters')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentDialogue = activeTab === 'talent' ? talentDialogueLines : companyDialogueLines;

  return (
    <section className="min-h-screen relative overflow-hidden bg-white">
      {/* Navigation Bar */}
      <motion.header
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 w-full pt-6 px-6"
      >
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between bg-white rounded-full px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {/* Left - Logo + Beta + Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <span className="font-display text-xl font-extrabold tracking-tight text-[#111111]">
                  HumiQ
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-hot/10 text-pink-hot">
                  Beta
                </span>
              </button>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-[#111111] hover:text-pink-hot transition-colors">
                  About Us
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-[#111111] hover:text-pink-hot transition-colors">
                  How it works
                </a>
              </nav>
            </div>

            {/* Center - Toggle */}
            <div className="hidden md:flex items-center gap-0 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => handleTabSwitch('talent')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'talent' 
                    ? 'bg-white text-[#111111] shadow-sm' 
                    : 'text-gray-500 hover:text-[#111111]'
                }`}
              >
                Talent
              </button>
              <button
                onClick={() => handleTabSwitch('company')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'company' 
                    ? 'bg-white text-[#111111] shadow-sm' 
                    : 'text-gray-500 hover:text-[#111111]'
                }`}
              >
                Hiring
              </button>
            </div>

            {/* Right - CTAs */}
            <div className="flex items-center gap-3">
              {/* Send Love Letters Button */}
              <motion.button
                onClick={scrollToLoveLetters}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 border-transparent hover:border-pink-hot/30 transition-all duration-300"
                style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #7C3AED 0%, #FF2FB2 100%) border-box',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4 text-pink-hot" />
                <span className="text-pink-hot">Send Love Letters</span>
              </motion.button>

              <motion.button
                onClick={handleTalentClick}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: '0 8px 24px rgba(255, 47, 178, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a candidate
              </motion.button>
              <motion.button
                onClick={handleCompanyClick}
                className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: '0 8px 24px rgba(255, 47, 178, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a Company
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 container max-w-6xl mx-auto px-6 flex items-center min-h-[calc(100vh-140px)]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-0">
          
          {/* Left Column - Text Content */}
          <motion.div
            className="text-left order-2 lg:order-1"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Headline with gradient */}
                <h1 className="font-display text-[40px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-6">
                  {activeTab === 'talent' ? (
                    <>
                      <motion.span 
                        className="block"
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{
                          background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        CVs are history.
                      </motion.span>
                      <motion.span 
                        className="block"
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                          background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Decisions are future.
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <motion.span 
                        className="block"
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{
                          background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Decisions, not resumes.
                      </motion.span>
                      <motion.span 
                        className="block"
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                          background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Hire with evidence.
                      </motion.span>
                    </>
                  )}
                </h1>

                {/* Subheadline */}
                <motion.p 
                  className="text-base md:text-lg max-w-md mb-8 leading-[1.7] text-[#111111]/70"
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {activeTab === 'talent' 
                    ? "HumiQ AI understands how you think, decide, and solve through real conversations and real work."
                    : "No job posts. No CVs. AI runs the first interviews. You get decision-ready talent in hours."
                  }
                </motion.p>

                {/* CTAs */}
                <motion.div 
                  className="flex items-center gap-6"
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.button
                    onClick={activeTab === 'talent' ? handleTalentClick : handleCompanyClick}
                    className="px-8 py-3.5 rounded-full text-base font-bold text-white relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 8px 32px rgba(255, 47, 178, 0.4)',
                      y: -2,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {activeTab === 'talent' ? 'Start Now' : 'Start Hiring'}
                  </motion.button>
                  <button 
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[#111111] text-base font-medium hover:text-pink-hot transition-colors relative group"
                  >
                    How it works →
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-pink-hot transition-all duration-300 group-hover:w-full" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Column - AI Card */}
          <motion.div 
            className="order-1 lg:order-2 relative"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Ambient glow behind card */}
            <motion.div 
              className="absolute -inset-10 rounded-[50px] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 47, 178, 0.15) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.05, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Dark Card */}
            <motion.div 
              className="relative rounded-[32px] p-8 bg-[#0B0B10] text-white shadow-2xl"
              whileHover={{ 
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with Orbi */}
              <div className="flex items-center gap-3 mb-8">
                <AIOrbi size="md" isWriting={isWriting} />
                <div>
                  <p className="text-xl font-bold text-white">HumiQ</p>
                  <p className="text-sm text-gray-400">
                    {activeTab === 'talent' ? 'Super Career Intelligence' : 'Decision-Ready Hiring Intelligence'}
                  </p>
                </div>
              </div>

              {/* AI Dialogue - Sequential reveal */}
              <div className="space-y-3 min-h-[200px] mb-8">
                <AnimatePresence>
                  {currentDialogue.slice(0, visibleLines).map((line, index) => (
                    <motion.p
                      key={`${activeTab}-${index}`}
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 8, x: -4 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="text-[15px] leading-relaxed text-gray-300"
                    >
                      {line}
                    </motion.p>
                  ))}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <motion.button
                onClick={activeTab === 'talent' ? handleTalentClick : handleCompanyClick}
                className="px-8 py-3.5 rounded-full text-[15px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 24px rgba(255, 47, 178, 0.5)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === 'talent' ? 'Start Now' : 'Start Hiring'}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile toggle */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center z-20 px-4"
      >
        <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-lg border border-gray-100">
          <button
            onClick={() => handleTabSwitch('talent')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'talent' 
                ? 'bg-gray-100 text-[#111111]' 
                : 'text-gray-500'
            }`}
          >
            Talent
          </button>
          <button
            onClick={() => handleTabSwitch('company')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === 'company' 
                ? 'bg-gray-100 text-[#111111]' 
                : 'text-gray-500'
            }`}
          >
            Hiring
          </button>
        </div>
      </motion.div>
    </section>
  );
}
