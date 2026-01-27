import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DECISION_TYPES = [
  'Prioritization',
  'Trade-offs',
  'Architecture',
  'Stakeholder alignment',
  'Execution strategy',
  'Team dynamics',
];

const PROBLEM_DOMAINS = [
  'Engineering',
  'Product',
  'Design',
  'Operations',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'soon', label: 'Soon' },
  { value: 'exploratory', label: 'Exploratory' },
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

interface RoleIntentStepProps {
  roleData: {
    roleName: string;
    primaryOutcome: string;
    decisions: string[];
    problemDomain: string;
    urgency: string;
    workMode: string;
  };
  setRoleData: (data: any) => void;
  onContinue: () => void;
}

export const RoleIntentStep = ({
  roleData,
  setRoleData,
  onContinue,
}: RoleIntentStepProps) => {
  const updateField = (field: string, value: any) => {
    setRoleData({ ...roleData, [field]: value });
  };

  const toggleDecision = (decision: string) => {
    const current = roleData.decisions || [];
    if (current.includes(decision)) {
      updateField('decisions', current.filter((d: string) => d !== decision));
    } else {
      updateField('decisions', [...current, decision]);
    }
  };

  const isValid =
    roleData.roleName?.trim() &&
    roleData.primaryOutcome?.trim() &&
    roleData.decisions?.length > 0 &&
    roleData.problemDomain &&
    roleData.urgency &&
    roleData.workMode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3"
        >
          Define role intent
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Describe what success looks like. HumiQ will translate this into interview intelligence.
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 md:p-8 space-y-8"
      >
        {/* Role Name */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Role name</Label>
          <Input
            placeholder="e.g., Senior Backend Engineer"
            value={roleData.roleName || ''}
            onChange={(e) => updateField('roleName', e.target.value)}
            className="h-12"
          />
        </div>

        {/* Primary Outcome */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Primary outcome</Label>
          <p className="text-xs text-muted-foreground">
            If this role succeeds in 6 months, what has changed?
          </p>
          <Textarea
            placeholder="Describe the tangible impact this person will create..."
            value={roleData.primaryOutcome || ''}
            onChange={(e) => updateField('primaryOutcome', e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Decisions this role owns */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Decisions this role owns</Label>
          <div className="flex flex-wrap gap-2">
            {DECISION_TYPES.map((decision) => (
              <button
                key={decision}
                type="button"
                onClick={() => toggleDecision(decision)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  roleData.decisions?.includes(decision)
                    ? 'bg-gradient-to-r from-[#5B8CFF] to-[#B983FF] text-white shadow-md'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {decision}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Domain */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Problem domain</Label>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => updateField('problemDomain', domain)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  roleData.problemDomain === domain
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Urgency</Label>
          <div className="flex flex-wrap gap-2">
            {URGENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('urgency', option.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  roleData.urgency === option.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Work Mode */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Work mode</Label>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => updateField('workMode', mode.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  roleData.workMode === mode.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onContinue}
          disabled={!isValid}
          size="lg"
          className="w-full gap-2 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
