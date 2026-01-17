import { CandidateBrief } from '@/types/brief';

export const mockBrief: CandidateBrief = {
  candidateName: 'Sarah Chen',
  role: 'Founding Engineer',
  decision: 'hire',
  workEvidence: [
    {
      id: '1',
      title: 'Distributed Task Queue (open-source)',
      explanation: 'Built and maintained a Redis-backed job queue handling 50k+ jobs/hour. Shows systems thinking and production-grade reliability patterns.',
      url: 'https://github.com/example/taskqueue',
      type: 'repo',
    },
    {
      id: '2',
      title: 'Shipped: Invoice Automation SaaS',
      explanation: 'Solo-built MVP to paying customers in 6 weeks. Demonstrates full-stack ownership and speed-to-value mindset.',
      url: 'https://example.com/invoiceapp',
      type: 'product',
    },
    {
      id: '3',
      title: 'Technical Blog: "Scaling PostgreSQL Writes"',
      explanation: 'Clear explanation of partitioning strategies with real benchmarks. Indicates ability to communicate complex tradeoffs.',
      url: 'https://blog.example.com/postgres-scaling',
      type: 'blog',
    },
    {
      id: '4',
      title: 'Live Demo: Real-time Collaboration Editor',
      explanation: 'CRDT-based collaborative text editor with presence. Evidence of tackling hard distributed systems problems.',
      url: 'https://demo.example.com/collab',
      type: 'demo',
    },
  ],
  strengths: [
    { id: '1', text: 'Ships production code independently — multiple solo projects from zero to users' },
    { id: '2', text: 'Strong systems intuition — evidence of understanding performance, reliability, and scaling' },
    { id: '3', text: 'Clear technical communicator — blog posts and documentation are well-structured' },
    { id: '4', text: 'Open-source contributions with maintenance follow-through' },
  ],
  risks: [
    { id: '1', question: 'How does she handle ambiguity when product direction is unclear?' },
    { id: '2', question: "What's her approach to making fast decisions with incomplete information?" },
    { id: '3', question: 'How does she prioritize when everything feels urgent?' },
  ],
  interviewPlan: [
    {
      timeRange: '0-10 min',
      objective: 'Establish context and warmth. Understand her current situation and motivations.',
      prompts: [
        "What are you looking for in your next role that you haven't found yet?",
        "Tell me about the project you're most proud of - what made it hard?",
      ],
    },
    {
      timeRange: '10-20 min',
      objective: 'Probe depth on systems thinking and ambiguity tolerance.',
      prompts: [
        'Walk me through a time you had to make a significant technical decision without complete information.',
        'How do you decide when something is "good enough" to ship?',
        'Describe a system you built that had to handle unexpected scale.',
      ],
    },
    {
      timeRange: '20-30 min',
      objective: 'Assess founder-engineer fit and working style.',
      prompts: [
        'What does a productive first 30 days look like for you at an early-stage startup?',
        'How do you prefer to work with a non-technical founder?',
      ],
    },
  ],
  outreachMessage: "Hi Sarah,\n\nI came across your work — particularly your distributed task queue and the invoice automation product you shipped. The combination of systems depth and product intuition is rare.\n\nWe're building [Company] and looking for a founding engineer. If you're open to exploring, I'd love to share more about what we're working on.\n\nNo pressure either way — I just wanted to reach out directly.\n\nBest,\n[Your name]",
};
