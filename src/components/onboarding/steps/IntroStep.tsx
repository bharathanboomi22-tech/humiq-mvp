import { OnboardingCard } from '../OnboardingCard';
import { Button } from '@/components/ui/button';

interface IntroStepProps {
  onContinue: () => void;
}

export const IntroStep = ({ onContinue }: IntroStepProps) => {
  return (
    <OnboardingCard className="text-center">
      <h1 className="text-3xl font-display font-semibold text-foreground mb-4">
        Create your Work Identity
      </h1>
      <p className="text-muted-foreground text-lg mb-2">
        This is context, not self-promotion.
      </p>
      <p className="text-muted-foreground/70 text-lg mb-8">
        No resumes. No selling.
      </p>

      <Button onClick={onContinue} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
        Continue
      </Button>
    </OnboardingCard>
  );
};
