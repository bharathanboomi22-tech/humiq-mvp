import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Target, Brain, Zap, Users } from 'lucide-react';

interface AIIntelligenceStepProps {
  roleData: {
    roleName: string;
    primaryOutcome: string;
    decisions: string[];
  };
  teamData: {
    optimizesFor: string;
    decisionStyle: string;
    pressurePoint: string;
  };
  onRunInterviews: () => void;
}

const FOCUS_AREAS = [
  {
    icon: Brain,
    title: 'Decision Clarity',
    description: 'How they navigate ambiguity and make trade-offs under pressure',
  },
  {
    icon: Target,
    title: 'Outcome Ownership',
    description: 'Track record of driving results without heavy process',
  },
  {
    icon: Users,
    title: 'Team Dynamics',
    description: 'How they collaborate, communicate, and handle conflict',
  },
  {
    icon: Zap,
    title: 'Execution Speed',
    description: 'Ability to move fast while maintaining quality standards',
  },
];

export const AIIntelligenceStep = ({
  roleData,
  teamData,
  onRunInterviews,
}: AIIntelligenceStepProps) => {
  // Generate a role intelligence summary based on input
  const generateSummary = () => {
    const decisionText = roleData.decisions?.join(', ') || 'key decisions';
    const styleText = teamData.decisionStyle?.replace('-', ' ') || 'autonomous';
    
    return `This role requires ownership without consensus, clarity under ambiguity, and long-term trade-off thinking. The ideal candidate operates in a ${styleText} environment and owns ${decisionText.toLowerCase()}.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto px-6"
    >
      {/* Header with AI Orb */}
      <div className="text-center mb-10">
        {/* AI Building Animation */}
        <motion.div
          className="relative inline-flex mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full cognitive-gradient"
            animate={{
              boxShadow: [
                '0 0 20px rgba(91, 140, 255, 0.3)',
                '0 0 40px rgba(185, 131, 255, 0.4)',
                '0 0 20px rgba(91, 140, 255, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3"
        >
          HumiQ has built interview intelligence
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground"
        >
          Based on your role intent and team context
        </motion.p>
      </div>

      {/* Intelligence Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 md:p-8 mb-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl ai-icon-container flex-shrink-0 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">
              Role Intelligence Summary
            </h2>
            <p className="text-sm text-foreground/70">{roleData.roleName}</p>
          </div>
        </div>

        <p className="text-foreground/80 leading-relaxed italic border-l-2 border-[#5B8CFF]/30 pl-4">
          "{generateSummary()}"
        </p>
      </motion.div>

      {/* Interview Focus Areas */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 md:p-8 mb-8"
      >
        <h3 className="font-semibold text-foreground mb-5">Interview Focus Areas</h3>
        <div className="grid gap-4">
          {FOCUS_AREAS.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-white/60"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5B8CFF]/10 to-[#B983FF]/10 flex items-center justify-center flex-shrink-0">
                <area.icon className="w-4 h-4 text-[#5B8CFF]" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">{area.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{area.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Note about no editing */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center text-xs text-muted-foreground mb-6"
      >
        Interview questions are generated by AI and optimized for your context.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={onRunInterviews}
          size="lg"
          className="w-full gap-3 h-14 rounded-xl bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white shadow-lg shadow-[#5B8CFF]/20"
        >
          <Play className="w-5 h-5" />
          Run Interviews
        </Button>
      </motion.div>
    </motion.div>
  );
};
