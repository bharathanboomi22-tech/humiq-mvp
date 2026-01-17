import { VerdictType, ConfidenceLevel } from '@/types/brief';
import { motion } from 'framer-motion';

interface VerdictHeaderProps {
  candidateName: string;
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  rationale: string;
}

const verdictLabels: Record<VerdictType, string> = {
  interview: 'Interview Now',
  caution: 'Proceed with Caution',
  pass: 'Do Not Advance',
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function VerdictHeader({ candidateName, verdict, confidence, rationale }: VerdictHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="pb-10"
    >
      {/* Candidate name */}
      <p className="text-sm text-muted-foreground mb-2">
        Founding Engineer Candidate
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-6">
        {candidateName}
      </h1>

      {/* Verdict and Confidence */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className={`verdict-${verdict} px-4 py-2 rounded-md text-sm font-medium`}>
          {verdictLabels[verdict]}
        </span>
        <span className="text-sm text-muted-foreground">
          Confidence: <span className={`signal-${confidence} font-medium`}>{confidenceLabels[confidence]}</span>
        </span>
      </div>

      {/* Rationale */}
      <p className="text-foreground/80 text-base leading-relaxed max-w-2xl">
        {rationale}
      </p>
    </motion.header>
  );
}
