import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData, WorkContextEntry } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkContextStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  onSkip: () => void;
  saving: boolean;
}

export const WorkContextStep = ({ data, updateField, onNext, onSkip, saving }: WorkContextStepProps) => {
  const addEntry = () => {
    if (data.workContext.length >= 3) return;
    updateField('workContext', [
      ...data.workContext,
      { company: '', role: '', startDate: '', endDate: '' },
    ]);
  };

  const removeEntry = (index: number) => {
    updateField(
      'workContext',
      data.workContext.filter((_, i) => i !== index)
    );
  };

  const updateEntry = (index: number, field: keyof WorkContextEntry, value: string) => {
    const updated = data.workContext.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    updateField('workContext', updated);
  };

  const hasEntries = data.workContext.length > 0;
  const isValid = hasEntries && data.workContext.every(e => e.company && e.role);

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Work Context</h2>
      <p className="text-muted-foreground text-sm mb-2">
        Give environmental context, not achievements.
      </p>
      <p className="text-xs text-muted-foreground/70 mb-6">
        No bullet points. No accomplishments. Just where you've operated.
      </p>

      <div className="space-y-4">
        {data.workContext.map((entry, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-border bg-background/50 space-y-3"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-muted-foreground">Entry {index + 1}</span>
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Input
              type="text"
              value={entry.company}
              onChange={(e) => updateEntry(index, 'company', e.target.value)}
              placeholder="Company / Product Name"
              className="bg-background/50"
            />

            <Input
              type="text"
              value={entry.role}
              onChange={(e) => updateEntry(index, 'role', e.target.value)}
              placeholder="Role"
              className="bg-background/50"
            />

            <div className="flex gap-2">
              <Input
                type="text"
                value={entry.startDate}
                onChange={(e) => updateEntry(index, 'startDate', e.target.value)}
                placeholder="Start (e.g., Jan 2022)"
                className="flex-1 bg-background/50"
              />
              <Input
                type="text"
                value={entry.endDate}
                onChange={(e) => updateEntry(index, 'endDate', e.target.value)}
                placeholder="End or Present"
                className="flex-1 bg-background/50"
              />
            </div>
          </div>
        ))}

        {data.workContext.length < 3 && (
          <button
            type="button"
            onClick={addEntry}
            className={cn(
              'w-full py-3 rounded-xl border-2 border-dashed border-border',
              'text-muted-foreground hover:border-accent/30 hover:text-foreground',
              'transition-colors flex items-center justify-center gap-2'
            )}
          >
            <Plus className="w-4 h-4" />
            Add work context
          </button>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={onSkip} variant="outline" className="flex-1">
          Skip for now
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid || saving}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </OnboardingCard>
  );
};
