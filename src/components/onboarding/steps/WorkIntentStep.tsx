import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  {
    value: 'open' as const,
    emoji: '🟢',
    label: 'Open to work',
    description: 'Actively looking for new opportunities',
  },
  {
    value: 'exploring' as const,
    emoji: '🟡',
    label: 'Quietly exploring',
    description: 'Open to the right opportunity',
  },
  {
    value: 'not_open' as const,
    emoji: '🔴',
    label: 'Not open right now',
    description: 'Happy where I am',
  },
];

interface WorkIntentStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export const WorkIntentStep = ({ data, updateField, onNext, saving }: WorkIntentStepProps) => {
  const isValid = data.availabilityStatus;

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Work Intent</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Set expectations upfront. No rejection anxiety.
      </p>

      <div className="space-y-3">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateField('availabilityStatus', option.value)}
            className={cn(
              'w-full p-4 rounded-xl border text-left transition-all',
              data.availabilityStatus === option.value
                ? 'border-accent/30 bg-accent/10'
                : 'border-border bg-background/50 hover:border-accent/30'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.emoji}</span>
              <div>
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Founders only reach out when this matches.
      </p>

      <Button
        onClick={onNext}
        disabled={!isValid || saving}
        className="w-full mt-6"
        size="lg"
      >
        {saving ? 'Saving...' : 'Continue'}
      </Button>
    </OnboardingCard>
  );
};
