import { TalentBrief, RoleContext } from './types';

export const MOCK_ROLE_CONTEXT: RoleContext = {
  title: 'Product Engineer',
  primaryOutcome: 'ownership under ambiguity',
  interviewStatus: 'complete',
};

export const MOCK_TALENTS: TalentBrief[] = [
  {
    id: '1',
    name: 'Alex Chen',
    tier: 'strong',
    workIdentity: {
      howTheyWork:
        'Approaches problems by first mapping constraints before solution exploration. Prefers async communication with documented decisions. Demonstrates strong ownership patterns — takes initiative without waiting for permission, but communicates direction clearly.',
      howTheyDecide: [
        'Optimizes for long-term maintainability over speed when stakes are high',
        'Makes reversible decisions quickly, slows down for irreversible ones',
        'Seeks minimal clarity before moving — comfortable with 70% confidence',
      ],
      whatToBeAwareOf: [
        'May need coaching on stakeholder communication in politically complex environments',
        'Prefers deep focus blocks — may push back on excessive meetings',
      ],
    },
    interviewHighlights: [
      'Reframed the problem before solving — identified hidden constraints',
      'I would rather ship something imperfect and learn than wait for consensus',
    ],
  },
  {
    id: '2',
    name: 'Jordan Rivera',
    tier: 'strong',
    workIdentity: {
      howTheyWork:
        'Collaborative but autonomous. Excels in ambiguous environments by creating clarity for others. Documents thinking in real-time, making their process visible to the team.',
      howTheyDecide: [
        'First-principles thinker — questions assumptions before accepting constraints',
        'Seeks minimal viable clarity before moving forward',
        'Comfortable making unpopular decisions when evidence supports them',
      ],
      whatToBeAwareOf: [
        'Can move faster than some teams are comfortable with',
        'May challenge existing processes — ensure this is welcomed',
      ],
    },
    interviewHighlights: [
      'Clarity is my responsibility, not something I wait for',
      'Explained trade-offs clearly under pressure without defensiveness',
    ],
  },
  {
    id: '3',
    name: 'Sam Patel',
    tier: 'contextual',
    workIdentity: {
      howTheyWork:
        'Structured approach with strong systems thinking. Methodical executor who builds for scale from day one. Prefers well-defined problem spaces.',
      howTheyDecide: [
        'Data-informed decision maker — seeks validation before commitment',
        'Prefers proven approaches over experimental ones',
        'Reduces risk systematically through incremental delivery',
      ],
      whatToBeAwareOf: [
        'Thrives in structured environments — may need adjustment period in chaotic startups',
        'Could be slower to move in highly ambiguous situations',
      ],
    },
    interviewHighlights: [
      'I build systems that scale, not quick fixes that create debt',
      'Demonstrated strong analytical framework for breaking down complex problems',
    ],
  },
  {
    id: '4',
    name: 'Morgan Kim',
    tier: 'future',
    workIdentity: {
      howTheyWork:
        'Currently developing ownership muscles at a larger company. Shows strong growth trajectory and hunger for more autonomy. Learning to operate without detailed specifications.',
      howTheyDecide: [
        'Building confidence in independent decision-making',
        'Strong analytical foundation — translating that to action',
        'Actively seeking more ownership opportunities',
      ],
      whatToBeAwareOf: [
        'Would benefit from mentorship in ambiguous environments',
        'High potential — better fit in 12-18 months with right guidance',
      ],
    },
    interviewHighlights: [
      'I want to own outcomes, not just complete tasks',
      'Showed self-awareness about growth areas and concrete plans to address them',
    ],
  },
];
