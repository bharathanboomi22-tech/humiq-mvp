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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mb-16"
    >
      {/* Candidate name */}
      {candidateName && !isInsufficientEvidence && (
        <p className="text-sm text-muted-foreground mb-8 tracking-wide">
          {candidateName}
        </p>
      )}

      {/* Verdict — the first thing seen */}
      <div className="mb-6">
        <span className={`verdict-${verdict} inline-block px-4 py-2 rounded text-sm font-medium tracking-wide`}>
          {verdictLabels[verdict]}
        </span>
      </div>

      {/* Confidence */}
      <p className="text-xs text-muted-foreground mb-6 tracking-wider uppercase">
        Confidence: <span className={`signal-${confidence}`}>{confidenceLabels[confidence]}</span>
      </p>

      {/* Rationale — the judgment line */}
      <p className="text-foreground/85 text-lg leading-relaxed max-w-lg font-display">
        {rationale}
      </p>
    </motion.header>
  );
}