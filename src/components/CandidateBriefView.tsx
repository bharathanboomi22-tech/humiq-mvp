import { CandidateBrief } from '@/types/brief';
import { VerdictHeader } from './VerdictHeader';
import { RealWorkEvidenceSection } from './RealWorkEvidenceSection';
import { SignalSynthesisSection } from './SignalSynthesisSection';
import { RisksUnknownsSection } from './RisksUnknownsSection';
import { ValidationPlanSection } from './ValidationPlanSection';
import { FounderRecommendationSection } from './FounderRecommendationSection';
import { ActionSection } from './ActionSection';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface CandidateBriefViewProps {
  brief: CandidateBrief;
  onBack: () => void;
}

export function CandidateBriefView({ brief, onBack }: CandidateBriefViewProps) {
  const isInsufficientEvidence = 
    brief.verdict === 'caution' && 
    brief.confidence === 'low' &&
    (!brief.workArtifacts || brief.workArtifacts.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-xl mx-auto"
    >
      {/* Back — subtle hover lift */}
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, delay: 0.02, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={onBack}
        className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 mb-20"
      >
        <ArrowLeft className="w-4 h-4" />
        New evaluation
      </motion.button>

      {/* 0) Verdict Header */}
      <VerdictHeader
        candidateName={brief.candidateName}
        verdict={brief.verdict}
        confidence={brief.confidence}
        rationale={brief.rationale}
        isInsufficientEvidence={isInsufficientEvidence}
      />
      
      {!isInsufficientEvidence && (
        <>
          {/* 1) Real Work Evidence */}
          <RealWorkEvidenceSection artifacts={brief.workArtifacts} />
          
          {/* 2) Signal Synthesis */}
          <SignalSynthesisSection signals={brief.signalSynthesis} />
          
          {/* 3) Risks & Unknowns */}
          <RisksUnknownsSection risks={brief.risksUnknowns} />
        </>
      )}
      
      {/* 4) Validation Plan */}
      <ValidationPlanSection plan={brief.validationPlan} />
      
      {/* 5) Founder Recommendation */}
      {!isInsufficientEvidence && (
        <FounderRecommendationSection recommendation={brief.recommendation} />
      )}

      {/* 6) Action Section — collapsible */}
      {!isInsufficientEvidence && (
        <ActionSection candidateName={brief.candidateName} />
      )}

      {/* Footer — understated */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14, delay: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-20 pb-10 border-t border-border/60"
      >
        <p className="text-xs text-muted-foreground/70 tracking-wider">
          HumIQ
        </p>
      </motion.footer>
    </motion.div>
  );
}