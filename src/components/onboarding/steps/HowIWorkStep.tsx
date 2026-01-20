import { useState, useEffect } from 'react';
import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PLACEHOLDER_EXAMPLES = [
  'I prefer clear goals and autonomy to decide the approach.',
  'I work best with fast feedback and shipping in small iterations.',
  "I'm comfortable in messy environments and like defining structure.",
  'I thrive in collaborative settings with regular check-ins.',
  'I like owning problems end-to-end and driving to resolution.',
];

interface HowIWorkStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export const HowIWorkStep = ({ data, updateField, onNext, saving }: HowIWorkStepProps) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isValid = data.howIWork.trim().length >= 20;

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">How You Work</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Your human differentiator.
      </p>

      <div>
        <Label className="text-foreground">
          In one or two sentences, how do you like to work?
        </Label>
        <Textarea
          value={data.howIWork}
          onChange={(e) => updateField('howIWork', e.target.value)}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          rows={4}
          className="mt-2 bg-background/50"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {data.howIWork.length < 20
            ? `At least ${20 - data.howIWork.length} more characters`
            : 'Looking good!'
          }
        </p>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid || saving}
        className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground"
        size="lg"
      >
        {saving ? 'Saving...' : 'Continue'}
      </Button>
    </OnboardingCard>
  );
};
