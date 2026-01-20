import { User, Mail, MapPin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TalentOnboardingData, AVAILABLE_LANGUAGES } from '@/types/discovery';

interface BasicsStepProps {
  data: TalentOnboardingData;
  updateField: <K extends keyof TalentOnboardingData>(field: K, value: TalentOnboardingData[K]) => void;
}

export function BasicsStep({ data, updateField }: BasicsStepProps) {
  const toggleLanguage = (lang: string) => {
    const current = data.languages || [];
    if (current.includes(lang)) {
      updateField('languages', current.filter(l => l !== lang));
    } else {
      updateField('languages', [...current, lang]);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mx-auto mb-4">
          <User className="w-7 h-7 text-accent" />
        </div>
        <CardTitle className="text-2xl">About You</CardTitle>
        <CardDescription>
          Let's start with some basic information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            placeholder="Paris, France"
            value={data.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground">City and country</p>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Languages you speak
          </Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={data.languages.includes(lang) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  data.languages.includes(lang) 
                    ? 'bg-accent hover:bg-accent/80' 
                    : 'hover:border-accent/50'
                }`}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click to select/deselect</p>
        </div>
      </CardContent>
    </Card>
  );
}
