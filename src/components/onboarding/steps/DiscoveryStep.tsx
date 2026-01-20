import { useEffect } from 'react';
import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DiscoveryChat } from '@/components/discovery/DiscoveryChat';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DiscoveryStepProps {
  data: OnboardingData;
  onNext: () => void;
  saving: boolean;
}

export const DiscoveryStep = ({ data, onNext, saving }: DiscoveryStepProps) => {
  const {
    messages,
    currentQuestionIndex,
    totalQuestions,
    isLoading,
    isComplete,
    isSaving,
    startDiscovery,
    submitAnswer,
    completeDiscovery,
  } = useDiscovery();

  // Start discovery when component mounts
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      startDiscovery({
        fullName: data.fullName,
        primaryRole: data.primaryRole,
        experienceRange: data.experienceRange,
        workContext: data.workContext,
        workLinks: data.workLinks,
        howIWork: data.howIWork,
      });
    }
  }, []);

  const handleComplete = async () => {
    const success = await completeDiscovery();
    if (success) {
      onNext();
    }
  };

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
        Let's Get to Know You
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        I'll ask a few questions to understand your work style, mindset, and skills.
        <br />
        This will help us determine your profile and suggest the right technical tests.
      </p>

      <div className="h-[400px] min-h-[400px]">
        {messages.length === 0 && isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : (
          <DiscoveryChat
            messages={messages}
            onSubmit={submitAnswer}
            isLoading={isLoading}
            isComplete={isComplete}
            currentQuestion={currentQuestionIndex}
            totalQuestions={totalQuestions}
          />
        )}
      </div>

      {isComplete && (
        <Button
          onClick={handleComplete}
          disabled={isSaving || saving}
          className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </Button>
      )}
    </OnboardingCard>
  );
};
