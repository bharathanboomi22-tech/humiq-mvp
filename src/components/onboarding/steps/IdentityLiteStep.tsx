import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, MapPin, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '@/hooks/useTalentOnboarding';

interface IdentityLiteStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

export function IdentityLiteStep({ data, updateField, onNext, saving }: IdentityLiteStepProps) {
  const [visibleFields, setVisibleFields] = useState(1);

  // Progressively reveal fields
  useEffect(() => {
    if (data.fullName && visibleFields === 1) {
      setTimeout(() => setVisibleFields(2), 300);
    }
    if (data.email && visibleFields === 2) {
      setTimeout(() => setVisibleFields(3), 300);
    }
  }, [data.fullName, data.email, visibleFields]);

  const isValid = data.fullName.trim() && data.email.trim();

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-3">
          Let's save your progress
        </h1>
        <p className="text-muted-foreground">
          Just the basics — nothing more.
        </p>
      </motion.div>

      {/* Form */}
      <div className="space-y-6">
        {/* Full Name - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground">
            <User className="w-4 h-4 text-muted-foreground" />
            Full name
            <span className="text-accent">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your name"
            value={data.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="h-12 bg-white/70 border-border/50 focus:border-accent"
            autoFocus
          />
        </motion.div>

        {/* Email - Revealed after name */}
        <AnimatePresence>
          {visibleFields >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email address
                <span className="text-accent">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-12 bg-white/70 border-border/50 focus:border-accent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Toggle */}
        <AnimatePresence>
          {visibleFields >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <Label className="text-foreground">Work status</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('availabilityStatus', 'open')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    data.availabilityStatus === 'open'
                      ? 'bg-accent/10 border-accent text-foreground'
                      : 'bg-white/50 border-border/50 text-muted-foreground hover:bg-white/70'
                  }`}
                >
                  <div className="font-medium">Open to work</div>
                  <div className="text-xs opacity-70">Ready for opportunities</div>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('availabilityStatus', 'exploring')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    data.availabilityStatus === 'exploring'
                      ? 'bg-accent/10 border-accent text-foreground'
                      : 'bg-white/50 border-border/50 text-muted-foreground hover:bg-white/70'
                  }`}
                >
                  <div className="font-medium">Quietly exploring</div>
                  <div className="text-xs opacity-70">Just looking around</div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional fields */}
        <AnimatePresence>
          {visibleFields >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4 pt-4 border-t border-border/30"
            >
              <p className="text-xs text-muted-foreground">Optional — helps with matching</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City"
                    value={data.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="h-10 bg-white/50 border-border/30 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" />
                    Timezone
                  </Label>
                  <Input
                    id="timezone"
                    placeholder="Auto-detected"
                    value={data.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="h-10 bg-white/50 border-border/30 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isValid ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
        className="mt-10"
      >
        <Button
          onClick={onNext}
          disabled={!isValid || saving}
          size="lg"
          className="w-full gap-2 bg-foreground hover:bg-foreground/90 text-background"
        >
          {saving ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
