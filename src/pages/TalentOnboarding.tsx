import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTalentOnboarding } from '@/hooks/useTalentOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { IntroStep } from '@/components/onboarding/steps/IntroStep';
import { HumanBasicsStep } from '@/components/onboarding/steps/HumanBasicsStep';
import { WorkIntentStep } from '@/components/onboarding/steps/WorkIntentStep';
import { WorkRoleStep } from '@/components/onboarding/steps/WorkRoleStep';
import { WorkContextStep } from '@/components/onboarding/steps/WorkContextStep';
import { WorkLinksStep } from '@/components/onboarding/steps/WorkLinksStep';
import { HowIWorkStep } from '@/components/onboarding/steps/HowIWorkStep';
import { PrivacyStep } from '@/components/onboarding/steps/PrivacyStep';
import { DiscoveryStep } from '@/components/onboarding/steps/DiscoveryStep';
import { SuccessStep } from '@/components/onboarding/steps/SuccessStep';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getStoredTalentId, getTalentProfile } from '@/lib/talent';

// Steps: Intro (0), HumanBasics (1), WorkIntent (2), WorkRole (3), WorkContext (4), WorkLinks (5), HowIWork (6), Privacy (7), Discovery (8), Success (9)
const TOTAL_STEPS = 10;

const TalentOnboardingContent = () => {
  const navigate = useNavigate();
  const {
    data,
    updateField,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    loading,
    saving,
  } = useTalentOnboarding();

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

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      nextStep(); // Go to success screen
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IntroStep onContinue={nextStep} />;
      case 1:
        return (
          <HumanBasicsStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 2:
        return (
          <WorkIntentStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 3:
        return (
          <WorkRoleStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 4:
        return (
          <WorkContextStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            onSkip={nextStep}
            saving={saving}
          />
        );
      case 5:
        return (
          <WorkLinksStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            onSkip={nextStep}
            saving={saving}
          />
        );
      case 6:
        return (
          <HowIWorkStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 7:
        return (
          <PrivacyStep
            data={data}
            updateField={updateField}
            onNext={nextStep}
            saving={saving}
          />
        );
      case 8:
        return (
          <DiscoveryStep
            data={data}
            onNext={handleComplete}
            saving={saving}
          />
        );
      case 9:
        return <SuccessStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onBack={prevStep}
      showBack={currentStep > 0 && currentStep < 9}
      stepLabel="Step 1 of 2 — Work Identity"
    >
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </OnboardingLayout>
  );
};

const TalentOnboarding = () => {
  return <TalentOnboardingContent />;
};

export default TalentOnboarding;
