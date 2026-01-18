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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: easing }}
      className="mb-16"
    >
      {/* Candidate name — understated */}
      {candidateName && !isInsufficientEvidence && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.08, ease: easing }}
          className="text-sm text-muted-foreground mb-8 tracking-wide"
        >
          {candidateName}
        </motion.p>
      )}

      {/* Verdict — H1 size, with subtle glow */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: easing }}
        className="mb-6"
      >
        <span 
          className={`verdict-${verdict} inline-block px-5 py-3 rounded-lg text-[34px] md:text-[40px] font-semibold tracking-tight font-display`}
        >
          {verdictLabels[verdict]}
        </span>
      </motion.div>

      {/* Confidence — de-emphasized */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: 0.16, ease: easing }}
        className="section-header mb-6"
      >
        Confidence: <span className={`signal-${confidence}`}>{confidenceLabels[confidence]}</span>
      </motion.p>

      {/* Rationale — readable, max ~70 chars per line */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.24, ease: easing }}
        className="text-foreground text-base md:text-lg leading-relaxed max-w-[65ch] font-display"
      >
        {rationale}
      </motion.p>
    </motion.header>
  );
}
