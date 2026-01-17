import { VerdictType, ConfidenceLevel } from '@/types/brief';
import { motion } from 'framer-motion';

interface VerdictHeaderProps {
  candidateName: string;
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  rationale: string;
  isInsufficientEvidence?: boolean;
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

export function VerdictHeader({ 
  candidateName, 
  verdict, 
  confidence, 
  rationale,
  isInsufficientEvidence 
}: VerdictHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className="pb-12"
    >
      {/* Candidate name - only show if found in evidence */}
      {candidateName && !isInsufficientEvidence && (
        <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-6">
          {candidateName}
        </h1>
      )}

      {/* Verdict badge + Confidence label */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className={`verdict-${verdict} px-4 py-2 rounded-md text-sm font-medium`}>
          {verdictLabels[verdict]}
        </span>
        <span className="text-sm text-muted-foreground">
          Confidence: <span className={`signal-${confidence} font-medium`}>{confidenceLabels[confidence]}</span>
        </span>
      </div>

      {/* One-line rationale */}
      <p className="text-foreground/80 text-base leading-relaxed max-w-xl">
        {rationale}
      </p>
    </motion.header>
  );
}
