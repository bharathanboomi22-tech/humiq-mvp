import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export const PrivacyStep = ({ data, updateField, onNext, saving }: PrivacyStepProps) => {
  return (
    <OnboardingCard>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-accent" />
        <h2 className="text-2xl font-display font-semibold text-foreground">Privacy & Control</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Your work stays yours. You're always in control.
      </p>

      <div className="space-y-4">
        {/* Profile Visibility */}
        <div className="p-4 rounded-xl border border-border bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Profile Visibility</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('profileVisibility', 'public')}
              className={cn(
                'flex-1 py-3 px-3 text-sm rounded-xl border transition-all flex items-center justify-center gap-2',
                data.profileVisibility === 'public'
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-background/50 text-muted-foreground hover:border-accent/30'
              )}
            >
              <Eye className="w-4 h-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => updateField('profileVisibility', 'private')}
              className={cn(
                'flex-1 py-3 px-3 text-sm rounded-xl border transition-all flex items-center justify-center gap-2',
                data.profileVisibility === 'private'
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-background/50 text-muted-foreground hover:border-accent/30'
              )}
            >
              <EyeOff className="w-4 h-4" />
              Private
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.profileVisibility === 'public'
              ? 'Visible to companies on HumiQ'
              : 'Visible only when you share'
            }
          </p>
        </div>

      </div>

      <Button onClick={onNext} disabled={saving} className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
        {saving ? 'Saving...' : 'Complete Setup'}
      </Button>
    </OnboardingCard>
  );
};
