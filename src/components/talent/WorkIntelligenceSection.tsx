import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConsolidatedProfile } from '@/types/talent';

interface Recommendation {
  title: string;
  explanation: string;
  action: 'work-session' | 'practice';
}

interface IntelligenceCardData {
  type: 'strength' | 'weakness' | 'risk';
  summary: string;
  explanation: string;
  recommendations: Recommendation[];
  growthNote?: string;
}

interface WorkIntelligenceSectionProps {
  consolidatedProfile?: ConsolidatedProfile | null;
}

// Generate intelligence data from consolidated profile
const generateIntelligenceData = (profile?: ConsolidatedProfile | null): IntelligenceCardData[] => {
  if (!profile) return [];

  const cards: IntelligenceCardData[] = [];

  // Generate Strength card
  if (profile.strengths && profile.strengths.length > 0) {
    const primaryStrength = profile.strengths[0];
    cards.push({
      type: 'strength',
      summary: primaryStrength,
      explanation: `Based on your work patterns and responses, you demonstrate consistent capability in this area. This strength appears across multiple signals in your profile, suggesting it's a reliable part of how you approach problems.`,
      recommendations: [
        {
          title: 'Frame ambiguity into a decision brief',
          explanation: 'This helps you create clarity for teams and stakeholders.',
          action: 'work-session',
        },
        {
          title: 'Lead a technical design review',
          explanation: 'Practice articulating trade-offs to cross-functional teams.',
          action: 'work-session',
        },
      ],
      growthNote: 'This strength compounds fastest when paired with long-term planning exposure.',
    });
  }

  // Generate Weakness card
  if (profile.areasForGrowth && profile.areasForGrowth.length > 0) {
    const primaryWeakness = profile.areasForGrowth[0];
    cards.push({
      type: 'weakness',
      summary: primaryWeakness,
      explanation: `This represents an area where you have less demonstrated experience or exposure. It's not a failure—it's simply a capability that hasn't had as many opportunities to develop yet.`,
      recommendations: [
        {
          title: 'Practice structured planning exercises',
          explanation: 'Build comfort with longer time horizons.',
          action: 'practice',
        },
        {
          title: 'Simulate roadmap prioritization',
          explanation: 'Experience the trade-offs of multi-quarter thinking.',
          action: 'practice',
        },
      ],
      growthNote: 'This is a common growth area at your career stage.',
    });
  }

  // Generate Risk card (inferred from profile patterns)
  if (profile.strengths && profile.strengths.length > 0) {
    cards.push({
      type: 'risk',
      summary: 'May experience friction in teams with unclear ownership.',
      explanation: `Your profile suggests you thrive with clear problem ownership. In environments with ambiguous responsibilities or frequent context-switching, you may need additional strategies to stay effective.`,
      recommendations: [
        {
          title: 'Practice navigating ambiguous ownership',
          explanation: 'Build adaptability for less structured environments.',
          action: 'work-session',
        },
        {
          title: 'Develop stakeholder alignment techniques',
          explanation: 'Learn to create clarity even when it isn\'t given.',
          action: 'work-session',
        },
      ],
      growthNote: 'You perform best in teams with clear problem ownership.',
    });
  }

  return cards;
};

const IntelligenceCard = ({ data }: { data: IntelligenceCardData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const config = {
    strength: {
      icon: Sparkles,
      title: 'Strength',
      iconBg: 'bg-violet/10',
      iconColor: 'text-violet',
      borderHover: 'hover:border-violet/30',
    },
    weakness: {
      icon: TrendingUp,
      title: 'Weakness',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-500/30',
    },
    risk: {
      icon: AlertCircle,
      title: 'Risk',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-500',
      borderHover: 'hover:border-slate-500/30',
    },
  }[data.type];

  const Icon = config.icon;

  const handleAction = () => {
    navigate('/work-session/start');
  };

  return (
    <Card 
      className={cn(
        'glass-card overflow-hidden transition-all duration-300 cursor-pointer',
        config.borderHover,
        isExpanded && 'border-border'
      )}
    >
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-muted-foreground mb-0.5">{config.title}</h3>
          <p className="text-foreground font-semibold truncate">{data.summary}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CardContent className="pt-0 pb-5 px-5">
              <div className="pl-14 space-y-5">
                {/* Explanation */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.explanation}
                </p>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {data.type === 'strength' ? 'Recommended Actions' : data.type === 'weakness' ? 'Improvement Paths' : 'Mitigation Strategies'}
                  </h4>
                  {data.recommendations.map((rec, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-3"
                    >
                      <div>
                        <h5 className="font-semibold text-foreground text-sm">{rec.title}</h5>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.explanation}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction();
                        }}
                        className="gap-1.5"
                      >
                        {rec.action === 'work-session' ? 'Run a Work Session' : 'Practice this in real work'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Growth Note */}
                {data.growthNote && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground italic">
                      {data.growthNote}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export const WorkIntelligenceSection = ({ consolidatedProfile }: WorkIntelligenceSectionProps) => {
  const intelligenceData = generateIntelligenceData(consolidatedProfile);

  if (intelligenceData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-foreground mb-1">
          Work Intelligence
        </h2>
        <p className="text-sm text-muted-foreground">
          How you work, where you grow, and how to improve — without judgment.
        </p>
      </div>

      <div className="space-y-3">
        {intelligenceData.map((data, i) => (
          <IntelligenceCard key={data.type} data={data} />
        ))}
      </div>
    </motion.div>
  );
};