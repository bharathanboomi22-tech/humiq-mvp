import { useState, useEffect } from 'react';
import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData } from '@/hooks/useTalentOnboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin',
  'Hindi',
  'Arabic',
  'Portuguese',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Russian',
  'Italian',
];

interface HumanBasicsStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export const HumanBasicsStep = ({ data, updateField, onNext, saving }: HumanBasicsStepProps) => {
  const [visibleFields, setVisibleFields] = useState(1);

  useEffect(() => {
    if (data.fullName && visibleFields === 1) setVisibleFields(2);
    if (data.email && visibleFields === 2) setVisibleFields(3);
    if (data.location && visibleFields === 3) setVisibleFields(4);
  }, [data.fullName, data.email, data.location, visibleFields]);

  const toggleLanguage = (lang: string) => {
    const current = data.languages;
    if (current.includes(lang)) {
      updateField('languages', current.filter(l => l !== lang));
    } else {
      updateField('languages', [...current, lang]);
    }
  };

  const isValid = data.fullName && data.email && data.location && data.languages.length > 0;

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Human Basics</h2>
      <p className="text-muted-foreground text-sm mb-8">
        Let founders know who you are and how to work with you.
      </p>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Full Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="fullName" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Your full name"
              className="mt-2 bg-background/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              What should founders call you?
            </p>
          </motion.div>

          {/* Email */}
          {visibleFields >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@email.com"
                className="mt-2 bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used only for work requests and updates.
              </p>
            </motion.div>
          )}

          {/* Location */}
          {visibleFields >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor="location" className="text-foreground">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={data.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="City, Country"
                className="mt-2 bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Helps teams coordinate async work. Timezone: {data.timezone}
              </p>
            </motion.div>
          )}

          {/* Languages */}
          {visibleFields >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label className="text-foreground">Languages</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      data.languages.includes(lang)
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'bg-background/50 text-muted-foreground border-border hover:border-accent/30'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Languages you can work in comfortably.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
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
