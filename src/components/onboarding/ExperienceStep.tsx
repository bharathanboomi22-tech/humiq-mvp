import { Briefcase, TrendingUp, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TalentOnboardingData, AVAILABLE_ROLES } from '@/types/discovery';

interface ExperienceStepProps {
  data: TalentOnboardingData;
  updateField: <K extends keyof TalentOnboardingData>(field: K, value: TalentOnboardingData[K]) => void;
}

export function ExperienceStep({ data, updateField }: ExperienceStepProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mx-auto mb-4">
          <Briefcase className="w-7 h-7 text-accent" />
        </div>
        <CardTitle className="text-2xl">Your Experience</CardTitle>
        <CardDescription>
          Tell us about your professional background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Years of Experience */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Years of Experience <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.yearsExperience?.toString() || ''}
            onValueChange={(v) => updateField('yearsExperience', parseInt(v))}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Less than 1 year</SelectItem>
              <SelectItem value="1">1-2 years</SelectItem>
              <SelectItem value="3">3-5 years</SelectItem>
              <SelectItem value="5">5-8 years</SelectItem>
              <SelectItem value="8">8-12 years</SelectItem>
              <SelectItem value="12">12+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Your Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.level || ''}
            onValueChange={(v) => updateField('level', v as typeof data.level)}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">
                <div className="flex flex-col">
                  <span>Junior</span>
                  <span className="text-xs text-muted-foreground">0-2 years, learning the craft</span>
                </div>
              </SelectItem>
              <SelectItem value="mid">
                <div className="flex flex-col">
                  <span>Mid-Level</span>
                  <span className="text-xs text-muted-foreground">2-5 years, independent contributor</span>
                </div>
              </SelectItem>
              <SelectItem value="senior">
                <div className="flex flex-col">
                  <span>Senior</span>
                  <span className="text-xs text-muted-foreground">5+ years, leads features</span>
                </div>
              </SelectItem>
              <SelectItem value="lead">
                <div className="flex flex-col">
                  <span>Lead / Staff</span>
                  <span className="text-xs text-muted-foreground">8+ years, technical leadership</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Role */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Preferred Role <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.preferredRole}
            onValueChange={(v) => updateField('preferredRole', v)}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select role type" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role.toLowerCase().replace(/\s+/g, '_')}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
