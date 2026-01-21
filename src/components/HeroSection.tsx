import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { LoveLetterModal } from './LoveLetterModal';
import { useAuth } from '@/hooks/useAuth';

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

  const handleStart = () => {
    if (activeTab === 'talent') {
      setUserType('talent');
      navigate('/talent/onboarding');
    } else {
      setUserType('company');
      navigate('/company/setup');
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden blush-gradient">
      {/* Orbital AI Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Main orb */}
        <motion.div
          className="absolute w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        
        {/* Floating orbs */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              className="absolute w-[250px] h-[250px] md:w-[300px] md:h-[300px] rounded-full animate-float"
              style={{
                background: 'radial-gradient(circle, rgba(255, 200, 220, 0.12) 0%, transparent 70%)',
                filter: 'blur(40px)',
                top: '20%',
                left: '15%',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.3 }}
            />
            
            <motion.div
              className="absolute w-[200px] h-[200px] md:w-[250px] md:h-[250px] rounded-full animate-float"
              style={{
                background: 'radial-gradient(circle, rgba(255, 192, 203, 0.1) 0%, transparent 70%)',
                filter: 'blur(50px)',
                bottom: '25%',
                right: '10%',
                animationDelay: '-8s',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />

            {/* Orbiting element */}
            <motion.div
              className="absolute w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full animate-orbit"
              style={{
                background: 'radial-gradient(circle, rgba(255, 214, 232, 0.2) 0%, transparent 60%)',
                filter: 'blur(20px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            />
          </>
        )}

        {/* Subtle pulse animation */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(255, 214, 232, 0.1) 0%, transparent 50%)',
            filter: 'blur(80px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
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
                onClick={() => setActiveTab('talent')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-400 ${
                  activeTab === 'talent'
                    ? 'bg-foreground text-background'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                Talent
              </button>
              <button
                onClick={() => setActiveTab('company')}
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

      {/* Hero Content - Centered */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-8 md:mb-10">
            CVs are history.
            <br />
            Decisions are the future.
          </h1>

          {/* Subheadline */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-12"
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Where the next wave of AI hiring happens with HumIQ.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={handleStart}
            className="pill-button-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4"
            whileHover={shouldReduceMotion ? {} : { y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Start
          </motion.button>
        </motion.div>
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