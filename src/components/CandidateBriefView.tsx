import { CandidateBrief } from '@/types/brief';
import { VerdictHeader } from './VerdictHeader';
import { RealWorkEvidenceSection } from './RealWorkEvidenceSection';
import { SignalSynthesisSection } from './SignalSynthesisSection';
import { RisksUnknownsSection } from './RisksUnknownsSection';
import { ValidationPlanSection } from './ValidationPlanSection';
import { FounderRecommendationSection } from './FounderRecommendationSection';
import { ActionLayerSection } from './ActionLayerSection';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface CandidateBriefViewProps {
  brief: CandidateBrief;
  onBack: () => void;
}

export function CandidateBriefView({ brief, onBack }: CandidateBriefViewProps) {
  // Check if this is an insufficient evidence case
  const isInsufficientEvidence = 
    brief.verdict === 'caution' && 
    brief.confidence === 'low' &&
    (!brief.workArtifacts || brief.workArtifacts.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14 }}
      className="max-w-xl mx-auto"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.12, delay: 0.04 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-100 mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        New evaluation
      </motion.button>

      {/* Brief content */}
      <VerdictHeader
        candidateName={brief.candidateName}
        verdict={brief.verdict}
        confidence={brief.confidence}
        rationale={brief.rationale}
        isInsufficientEvidence={isInsufficientEvidence}
      />
      
      {/* Only show these sections if sufficient evidence */}
      {!isInsufficientEvidence && (
        <>
          <RealWorkEvidenceSection artifacts={brief.workArtifacts} />
          <SignalSynthesisSection signals={brief.signalSynthesis} />
          <RisksUnknownsSection risks={brief.risksUnknowns} />
        </>
      )}
      
      {/* Validation plan always shows */}
      <ValidationPlanSection plan={brief.validationPlan} />
      
      {/* Only show recommendation and action if sufficient evidence */}
      {!isInsufficientEvidence && (
        <>
          <FounderRecommendationSection recommendation={brief.recommendation} />
          <ActionLayerSection action={brief.actionLayer} />
        </>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14, delay: 0.28 }}
        className="py-12 border-t border-border text-center"
      >
        <p className="text-xs text-muted-foreground">
          HumIQ — Work Evidence Brief
        </p>
      </motion.footer>
    </motion.div>
  );
}