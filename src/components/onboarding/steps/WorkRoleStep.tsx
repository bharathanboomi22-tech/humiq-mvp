import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ROLES = [
  'Software Engineer',
  'Product Designer',
  'Product Manager',
  'Data Scientist',
  'Engineering Manager',
  'UX Researcher',
  'DevOps Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
  'CTO',
  'Other',
];

const EXPERIENCE_RANGES = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' },
];

interface WorkRoleStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export const WorkRoleStep = ({ data, updateField, onNext, saving }: WorkRoleStepProps) => {
  const isValid = data.primaryRole && data.experienceRange;

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Work Role</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Anchor all downstream context.
      </p>

      <div className="space-y-6">
        {/* Primary Role */}
        <div>
          <Label className="text-foreground">Primary Role</Label>
          <Select
            value={data.primaryRole}
            onValueChange={(value) => updateField('primaryRole', value)}
          >
            <SelectTrigger className="mt-2 bg-background/50">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Range */}
        <div>
          <Label className="text-foreground">Experience Range</Label>
          <div className="flex gap-2 mt-2">
            {EXPERIENCE_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => updateField('experienceRange', range.value)}
                className={cn(
                  'flex-1 py-3 px-2 text-sm rounded-xl border transition-all',
                  data.experienceRange === range.value
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-accent/30'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Used for context, not ranking.
          </p>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!isValid || saving}
        className="w-full mt-8"
        size="lg"
      >
        {saving ? 'Saving...' : 'Continue'}
      </Button>
    </OnboardingCard>
  );
};
