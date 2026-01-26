import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTalentOnboarding } from '@/hooks/useTalentOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { SafetyStep } from '@/components/onboarding/steps/SafetyStep';
import { IdentityLiteStep } from '@/components/onboarding/steps/IdentityLiteStep';
import { AIWarmupStep } from '@/components/onboarding/steps/AIWarmupStep';
import { SignalCollectionStep } from '@/components/onboarding/steps/SignalCollectionStep';
import { StructuredContextStep } from '@/components/onboarding/steps/StructuredContextStep';
import { AIDeepWalkthroughStep } from '@/components/onboarding/steps/AIDeepWalkthroughStep';
import { LoadingExperience } from '@/components/LoadingExperience';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getStoredTalentId, getTalentProfile } from '@/lib/talent';

// Minimum time to show loading experience (in ms)
const MIN_LOADING_TIME = 8000;

// New Flow: Safety (0), Identity (1), AIWarmup (2), Signals (3), Context (4), DeepWalkthrough (5)
const TOTAL_STEPS = 6;

const TalentOnboardingContent = () => {
  const navigate = useNavigate();
  const {
    data,
    updateField,
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
    completeOnboarding,
    loading,
    saving,
    analyzing,
    analysisComplete,
    hasGitHub,
  } = useTalentOnboarding();

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const loadingStartTime = useRef<number | null>(null);

  // Check if onboarding is already completed and redirect
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (loading) return;
      
      const talentId = getStoredTalentId();
      if (!talentId) return;

      try {
        const profile = await getTalentProfile(talentId);
        if (profile?.onboarding_completed) {
          navigate('/talent/dashboard');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [loading, navigate]);

  // Start timer when analyzing begins
  useEffect(() => {
    if (analyzing && !loadingStartTime.current) {
      loadingStartTime.current = Date.now();
      setMinTimeElapsed(false);
      
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, MIN_LOADING_TIME);
      
      return () => clearTimeout(timer);
    }
  }, [analyzing]);

  // Navigate to dashboard when analysis is complete AND minimum time has elapsed
  useEffect(() => {
    if (analysisComplete && minTimeElapsed) {
      navigate('/talent/dashboard');
    }
  }, [analysisComplete, minTimeElapsed, navigate]);

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      if (!hasGitHub) {
        navigate('/talent/dashboard');
      }
      // If hasGitHub, the LoadingExperience will show
    }
  };

  const handleAnalysisComplete = () => {
    // Navigation happens in useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F5E8FF] to-[#FFE8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] opacity-30 blur-lg animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>
          <p className="text-muted-foreground">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  // Show loading experience while analyzing GitHub
  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F5E8FF] to-[#FFE8F0]">
        <LoadingExperience onComplete={handleAnalysisComplete} />
      </div>
    );
  }

  // Step labels for progress
  const getStepLabel = () => {
    switch (currentStep) {
      case 0: return '';
      case 1: return 'Identity';
      case 2: return 'Warm-up';
      case 3: return 'Signals';
      case 4: return 'Context';
      case 5: return 'Deep Dive';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SafetyStep 
            onContinue={nextStep} 
            onLearnMore={() => setShowHowItWorks(true)} 
          />
        );
      case 1:
        return (
          <IdentityLiteStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 2:
        return (
          <AIWarmupStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 3:
        return (
          <SignalCollectionStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            onSkipToChallenge={nextStep} // For now, just continue
            saving={saving}
          />
        );
      case 4:
        return (
          <StructuredContextStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 5:
        return (
          <AIDeepWalkthroughStep
            data={data}
            updateField={updateField}
            onComplete={handleComplete}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={prevStep}
        showBack={currentStep > 0}
        stepLabel={currentStep === 0 ? '' : `${getStepLabel()} — Step ${currentStep} of ${TOTAL_STEPS - 1}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </OnboardingLayout>

      {/* How It Works Modal (placeholder) */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-semibold mb-4">How HumiQ Works</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">1. We start with you</strong> — not a resume. 
                  A calm conversation to understand how you think and work.
                </p>
                <p>
                  <strong className="text-foreground">2. Share any real work</strong> — projects, links, 
                  or problems you've solved. Rough is fine.
                </p>
                <p>
                  <strong className="text-foreground">3. AI builds your Work Identity</strong> — a clear 
                  picture of how you approach problems, not a score.
                </p>
                <p>
                  <strong className="text-foreground">4. Get matched to teams</strong> — who value how you 
                  work, not just what's on paper.
                </p>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="mt-6 w-full py-3 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const TalentOnboarding = () => {
  return <TalentOnboardingContent />;
};

export default TalentOnboarding;
