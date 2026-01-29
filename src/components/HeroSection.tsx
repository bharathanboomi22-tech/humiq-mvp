import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  onSubmit?: (data: { githubUrl: string; otherLinks: string }) => void;
  isLoading?: boolean;
  onViewChange?: (view: 'talent' | 'company') => void;
}

export function HeroSection({ onSubmit, isLoading, onViewChange }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setUserType } = useAuth();
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
              <motion.button
                onClick={handleTalentClick}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(255, 47, 178, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up as a candidate
              </motion.button>
              <button
                onClick={handleCompanyClick}
                className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-semibold text-pink-hot hover:text-pink-vibrant transition-colors"
              >
                Sign up as a Company
              </button>
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
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Headline with gradient */}
            <h1 className="font-display text-[40px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-6">
              <span 
                className="block"
                style={{
                  background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CVs are history.
              </span>
              <span 
                className="block"
                style={{
                  background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Decisions are future.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg max-w-md mb-8 leading-[1.7] text-[#111111]/70">
              HumiQ AI understands how you think, decide, and solve through real conversations and real work.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handleTalentClick}
                className="px-8 py-3.5 rounded-full text-base font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 32px rgba(255, 47, 178, 0.4)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                Start Now
              </motion.button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#111111] text-base font-medium hover:text-pink-hot transition-colors"
              >
                How it works →
              </button>
            </div>
          </motion.div>

          {/* Right Column - AI Card */}
          <motion.div 
            className="order-1 lg:order-2"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Dark Card */}
            <div className="relative rounded-[32px] p-8 bg-[#0B0B10] text-white shadow-2xl">
              {/* Header */}
              <div className="mb-8">
                <p className="text-xl font-bold text-white">HumiQ</p>
                <p className="text-base text-gray-400 mt-1">Super Career Intelligence</p>
              </div>

              {/* AI Dialogue - Static Text */}
              <div className="space-y-4 min-h-[200px] mb-8">
                <p className="text-[15px] leading-relaxed text-gray-300">
                  I'm not here to read your CV.
                </p>
                <p className="text-[15px] leading-relaxed text-gray-300">
                  I'm interested in how you think, decide, and solve — in real situations.
                </p>
                <p className="text-[15px] leading-relaxed text-gray-300">
                  No keywords. No applications.
                </p>
                <p className="text-[15px] leading-relaxed text-gray-300">
                  Show me something you've worked on.
                </p>
                <p className="text-[15px] leading-relaxed text-gray-300">
                  It doesn't have to be perfect. Just real.
                </p>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleTalentClick}
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
                Start Now
              </motion.button>
            </div>
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
