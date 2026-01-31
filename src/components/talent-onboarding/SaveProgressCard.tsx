import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveProgressCardProps {
  onSave: (data: {
    name: string;
    email: string;
    workStatus: 'open' | 'exploring';
    location?: string;
    timezone?: string;
  }) => void;
  isLoading?: boolean;
}

const TIMEZONE_OPTIONS = [
  { value: '', label: 'Select timezone...' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export const SaveProgressCard = ({ onSave, isLoading = false }: SaveProgressCardProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workStatus, setWorkStatus] = useState<'open' | 'exploring'>('open');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('');

  const handleSubmit = () => {
    if (name.trim() && email.trim()) {
      onSave({
        name: name.trim(),
        email: email.trim(),
        workStatus,
        location: location.trim() || undefined,
        timezone: timezone || undefined,
      });
    }
  };

  const isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes('@');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: 'hsla(160, 25%, 10%, 0.9)',
        border: '1px solid hsla(168, 40%, 40%, 0.12)',
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Let's save your progress
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Just the basics — nothing more.
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Full name
            <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input-field w-full text-sm"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Email address
            <span className="text-primary">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="input-field w-full text-sm"
          />
        </div>

        {/* Work status */}
        <div className="space-y-2">
          <span className="text-sm text-foreground">Work status</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkStatus('open')}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200",
                workStatus === 'open'
                  ? "bg-primary/10 border-2 border-primary/40"
                  : "bg-secondary/30 border-2 border-transparent hover:border-primary/20"
              )}
            >
              <p className="text-sm font-medium text-foreground">Open to work</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ready for opportunities</p>
            </button>
            <button
              type="button"
              onClick={() => setWorkStatus('exploring')}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200",
                workStatus === 'exploring'
                  ? "bg-primary/10 border-2 border-primary/40"
                  : "bg-secondary/30 border-2 border-transparent hover:border-primary/20"
              )}
            >
              <p className="text-sm font-medium text-foreground">Quietly exploring</p>
              <p className="text-xs text-muted-foreground mt-0.5">Just looking around</p>
            </button>
          </div>
        </div>

        {/* Optional section */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3">
            Optional — helps with matching
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="input-field w-full text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-field w-full text-sm appearance-none cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={cn(
          "w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200",
          isValid && !isLoading
            ? "btn-primary"
            : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
        )}
      >
        {isLoading ? 'Saving...' : 'Continue →'}
      </button>
    </motion.div>
  );
};