export type DecisionTier = 'strong' | 'contextual' | 'future';

export interface TalentBrief {
  id: string;
  name: string;
  tier: DecisionTier;
  workIdentity: {
    howTheyWork: string;
    howTheyDecide: string[];
    whatToBeAwareOf: string[];
  };
  interviewHighlights: string[];
}

export interface RoleContext {
  title: string;
  primaryOutcome: string;
  interviewStatus: 'complete' | 'in-progress';
}

export const TIER_CONFIG: Record<
  DecisionTier,
  {
    label: string;
    description: string;
    bgClass: string;
    labelClass: string;
    borderClass: string;
  }
> = {
  strong: {
    label: 'Strong Hire',
    description: "Aligned with the role's outcomes and constraints today.",
    bgClass: 'bg-emerald-50/60',
    labelClass: 'text-emerald-700 bg-emerald-100/80',
    borderClass: 'border-emerald-200/60',
  },
  contextual: {
    label: 'Contextual Fit',
    description: 'Strong capability with trade-offs to consider.',
    bgClass: 'bg-amber-50/40',
    labelClass: 'text-amber-700 bg-amber-100/80',
    borderClass: 'border-amber-200/60',
  },
  future: {
    label: 'Future Fit',
    description: 'High potential, better aligned to a different phase or role.',
    bgClass: 'bg-slate-50/40',
    labelClass: 'text-slate-600 bg-slate-100/80',
    borderClass: 'border-slate-200/60',
  },
};
