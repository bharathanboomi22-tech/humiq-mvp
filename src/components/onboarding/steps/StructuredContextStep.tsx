import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, Globe, Languages, GraduationCap, 
  Award, ArrowRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OnboardingData } from '@/hooks/useTalentOnboarding';

interface StructuredContextStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

const EXPERIENCE_RANGES = [
  { value: '0-1', label: '< 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic'
];

export function StructuredContextStep({ 
  data, 
  updateField, 
  onNext, 
  saving 
}: StructuredContextStepProps) {
  const [showMoreLanguages, setShowMoreLanguages] = useState(false);

  const toggleLanguage = (lang: string) => {
    const current = data.languages || [];
    if (current.includes(lang)) {
      updateField('languages', current.filter(l => l !== lang));
    } else {
      updateField('languages', [...current, lang]);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-3">
          A bit more context
        </h1>
        <p className="text-muted-foreground">
          Optional details that help with matching — skip what doesn't apply.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Current Role */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="role" className="flex items-center gap-2 text-foreground">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Current role / what you do
          </Label>
          <Input
            id="role"
            placeholder="e.g., Product Designer, Full-stack Developer"
            value={data.primaryRole}
            onChange={(e) => updateField('primaryRole', e.target.value)}
            className="h-12 bg-white/70 border-border/50 focus:border-accent"
          />
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-foreground">
            <Award className="w-4 h-4 text-muted-foreground" />
            Years of experience
          </Label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => updateField('experienceRange', range.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  data.experienceRange === range.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 hover:bg-white/80 border border-border/30'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Location & Timezone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="bg-white/70 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2 text-foreground">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Timezone
            </Label>
            <Input
              id="timezone"
              placeholder="Auto-detected"
              value={data.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="bg-white/70 border-border/50"
            />
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-foreground">
            <Languages className="w-4 h-4 text-muted-foreground" />
            Spoken languages
          </Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.slice(0, showMoreLanguages ? undefined : 5).map((lang) => (
              <Badge
                key={lang}
                variant={data.languages?.includes(lang) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all duration-300 ${
                  data.languages?.includes(lang)
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-white/60 text-foreground/70 hover:bg-white/80 border-border/30'
                }`}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Badge>
            ))}
            {!showMoreLanguages && (
              <button
                onClick={() => setShowMoreLanguages(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                More <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Education summary - simple text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 pt-4 border-t border-border/20"
        >
          <Label htmlFor="education" className="flex items-center gap-2 text-muted-foreground text-sm">
            <GraduationCap className="w-4 h-4" />
            Education (optional — 1-2 lines)
          </Label>
          <Input
            id="education"
            placeholder="e.g., BS Computer Science, Stanford"
            className="bg-white/50 border-border/30 text-sm"
          />
        </motion.div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-10"
      >
        <Button
          onClick={onNext}
          disabled={saving}
          size="lg"
          className="w-full gap-2 bg-foreground hover:bg-foreground/90 text-background"
        >
          {saving ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          All fields optional — you can always update later
        </p>
      </motion.div>
    </div>
  );
}
