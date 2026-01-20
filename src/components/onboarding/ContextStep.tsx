import { Building2, Clock, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TalentOnboardingData } from '@/types/discovery';

interface ContextStepProps {
  data: TalentOnboardingData;
  updateField: <K extends keyof TalentOnboardingData>(field: K, value: TalentOnboardingData[K]) => void;
}

export function ContextStep({ data, updateField }: ContextStepProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mx-auto mb-4">
          <Building2 className="w-7 h-7 text-accent" />
        </div>
        <CardTitle className="text-2xl">Work Preferences</CardTitle>
        <CardDescription>
          Help us understand what you're looking for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Work Preference */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Work Location <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.workPreference || ''}
            onValueChange={(v) => updateField('workPreference', v as typeof data.workPreference)}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { value: 'remote', label: 'Remote', desc: '100% from home' },
              { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both' },
              { value: 'onsite', label: 'On-site', desc: 'In office' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  data.workPreference === option.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border/50 hover:border-accent/50'
                }`}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <span className="font-medium text-foreground">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.desc}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Availability <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.availability || ''}
            onValueChange={(v) => updateField('availability', v as typeof data.availability)}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: 'immediate', label: 'Immediately' },
              { value: '1_month', label: 'In 1 month' },
              { value: '3_months', label: 'In 3 months' },
              { value: 'not_looking', label: 'Just exploring' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                  data.availability === option.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border/50 hover:border-accent/50'
                }`}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <span className="font-medium text-foreground">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Contract Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Contract Type <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.contractType || ''}
            onValueChange={(v) => updateField('contractType', v as typeof data.contractType)}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: 'cdi', label: 'Permanent (CDI)' },
              { value: 'cdd', label: 'Fixed-term (CDD)' },
              { value: 'freelance', label: 'Freelance' },
              { value: 'internship', label: 'Internship' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                  data.contractType === option.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border/50 hover:border-accent/50'
                }`}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <span className="font-medium text-foreground">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
