import { OnboardingCard } from '../OnboardingCard';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  onComplete: () => void;
}

export const SuccessStep = ({ onComplete }: SuccessStepProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    onComplete();
    navigate('/talent/dashboard');
  };

  return (
    <OnboardingCard className="text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
      </div>

      <h1 className="text-3xl font-display font-semibold text-foreground mb-3">
        Your Work Identity is ready.
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your profile has been created and you're all set! You can now take technical tests to validate your skills.
      </p>

      <Button onClick={handleContinue} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
        Go to Dashboard →
      </Button>
    </OnboardingCard>
  );
};
