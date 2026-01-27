import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPTIMIZE_OPTIONS = [
  { value: 'speed', label: 'Speed' },
  { value: 'quality', label: 'Quality' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'stability', label: 'Stability' },
];

const DECISION_STYLES = [
  { value: 'founder-led', label: 'Founder-led' },
  { value: 'ownership-driven', label: 'Ownership-driven' },
  { value: 'consensus', label: 'Consensus' },
  { value: 'mixed', label: 'Mixed' },
];

const PRESSURE_POINTS = [
  { value: 'execution', label: 'Execution' },
  { value: 'communication', label: 'Communication' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'ownership', label: 'Ownership' },
];

interface TeamContextStepProps {
  teamData: {
    optimizesFor: string;
    decisionStyle: string;
    pressurePoint: string;
    ninetyDaySuccess: string;
  };
  setTeamData: (data: any) => void;
  onContinue: () => void;
  isLoading: boolean;
}

export const TeamContextStep = ({
  teamData,
  setTeamData,
  onContinue,
  isLoading,
}: TeamContextStepProps) => {
  const updateField = (field: string, value: any) => {
    setTeamData({ ...teamData, [field]: value });
  };

  const isValid =
    teamData.optimizesFor &&
    teamData.decisionStyle &&
    teamData.pressurePoint &&
    teamData.ninetyDaySuccess?.trim();

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
          How does this team actually work?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          This helps HumiQ understand how decisions happen inside your team.
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 md:p-8 space-y-8"
      >
        {/* Optimizes For */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            What does this team optimize for most?
          </Label>
          <div className="flex flex-wrap gap-2">
            {OPTIMIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('optimizesFor', option.value)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  teamData.optimizesFor === option.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decision Style */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            How are decisions made today?
          </Label>
          <div className="flex flex-wrap gap-2">
            {DECISION_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => updateField('decisionStyle', style.value)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  teamData.decisionStyle === style.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pressure Points */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            What usually breaks first under pressure?
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESSURE_POINTS.map((point) => (
              <button
                key={point.value}
                type="button"
                onClick={() => updateField('pressurePoint', point.value)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  teamData.pressurePoint === point.value
                    ? 'bg-foreground text-background'
                    : 'bg-white/60 text-foreground/70 border border-border hover:bg-white/80'
                )}
              >
                {point.label}
              </button>
            ))}
          </div>
        </div>

        {/* 90-Day Success */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            What does success look like in the first 90 days?
          </Label>
          <Textarea
            placeholder="Describe what you'd expect from this person in their first 90 days..."
            value={teamData.ninetyDaySuccess || ''}
            onChange={(e) => updateField('ninetyDaySuccess', e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <Button
          onClick={onContinue}
          disabled={!isValid || isLoading}
          size="lg"
          className="w-full gap-3 h-14 rounded-xl bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white shadow-lg shadow-[#5B8CFF]/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating Intelligence...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Interview Intelligence
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
