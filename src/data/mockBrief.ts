import { CandidateBrief } from '@/types/brief';

export const mockBrief: CandidateBrief = {
  candidateName: 'Sarah Chen',
  verdict: 'pass',
  confidence: 'high',
  rationale: 'Strong shipping and ownership signals, but limited evidence of collaboration in team environments.',
  
  workArtifacts: [
    {
      id: '1',
      title: 'Distributed Task Queue',
      url: 'https://github.com/example/taskqueue',
      whatItIs: 'Open-source Redis-backed job queue handling production workloads.',
      whyItMatters: 'Shows systems thinking and willingness to own infrastructure reliability — critical for a founding engineer who will build core systems.',
      signals: ['Ownership', 'Execution'],
    },
    {
      id: '2',
      title: 'Invoice Automation SaaS',
      url: 'https://example.com/invoiceapp',
      whatItIs: 'Solo-built MVP that reached paying customers in 6 weeks.',
      whyItMatters: 'Demonstrates full-stack ownership and speed-to-value mindset — evidence of shipping complete products, not just features.',
      signals: ['Shipping', 'Product Sense'],
    },
    {
      id: '3',
      title: 'Technical Blog: PostgreSQL Scaling',
      url: 'https://blog.example.com/postgres-scaling',
      whatItIs: 'Deep-dive on database partitioning strategies with real benchmarks.',
      whyItMatters: 'Clear communication of complex tradeoffs — suggests ability to explain technical decisions to non-technical stakeholders.',
      signals: ['Communication'],
    },
  ],

  signalSynthesis: [
    {
      name: 'Ownership',
      level: 'high',
      evidence: 'Multiple projects taken from zero to production with ongoing maintenance.',
    },
    {
      name: 'Judgment',
      level: 'medium',
      evidence: 'Technical blog shows nuanced thinking, but limited evidence of product tradeoff decisions.',
    },
    {
      name: 'Execution',
      level: 'high',
      evidence: 'Shipped SaaS MVP in 6 weeks with paying customers — clear bias toward action.',
    },
    {
      name: 'Communication',
      level: 'medium',
      evidence: 'Strong written communication; unclear how she collaborates in real-time with founders.',
    },
  ],

  risksUnknowns: [
    {
      id: '1',
      description: 'No evidence of working in a team environment — all projects appear solo.',
    },
    {
      id: '2',
      description: 'Unclear how she handles ambiguity when product direction is undefined.',
    },
    {
      id: '3',
      description: 'Limited exposure to production-scale systems beyond her own projects.',
    },
  ],

  validationPlan: {
    riskToValidate: 'Handling ambiguity when product direction is unclear',
    question: 'Tell me about a time you had to build something when you did not know what the right solution was. How did you decide what to do first?',
    strongAnswer: 'Describes a structured approach to reducing uncertainty — talks to users, builds cheapest test, iterates based on signal.',
  },

  recommendation: {
    verdict: 'pass',
    reasons: [
      'Strong evidence of shipping complete products independently — rare founder-engineer trait.',
      'Primary risk (team collaboration) is testable in a 30-minute conversation.',
    ],
  },
};
