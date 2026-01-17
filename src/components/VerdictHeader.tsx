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
      transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      {/* Candidate name — understated */}
      {candidateName && !isInsufficientEvidence && (
        <p className="text-sm text-muted-foreground mb-10 tracking-wide">
          {candidateName}
        </p>
      )}

      {/* Verdict — calm conclusion, stands alone */}
      <div className="mb-5">
        <span className={`verdict-${verdict} inline-block px-4 py-2.5 rounded-md text-sm font-medium tracking-wide`}>
          {verdictLabels[verdict]}
        </span>
      </div>

      {/* Confidence — de-emphasized */}
      <p className="text-xs text-muted-foreground/80 mb-8 tracking-wider uppercase">
        Confidence: <span className={`signal-${confidence}`}>{confidenceLabels[confidence]}</span>
      </p>

      {/* Rationale — the judgment line, readable */}
      <p className="text-foreground/90 text-lg leading-relaxed max-w-xl font-display">
        {rationale}
      </p>
    </motion.header>
  );
}