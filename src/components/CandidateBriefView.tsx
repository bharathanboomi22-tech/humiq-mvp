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
      transition={{ duration: 0.2 }}
      className="max-w-lg mx-auto"
    >
      {/* Back */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-16"
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.35 }}
        className="pt-16 pb-8 border-t border-border"
      >
        <p className="text-xs text-muted-foreground tracking-wider">
          HumIQ
        </p>
      </motion.footer>
    </motion.div>
  );
}