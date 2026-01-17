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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      className="max-w-2xl mx-auto"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.14, delay: 0.05 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        New Analysis
      </motion.button>

      {/* Brief content */}
      <VerdictHeader
        candidateName={brief.candidateName}
        verdict={brief.verdict}
        confidence={brief.confidence}
        rationale={brief.rationale}
      />
      <RealWorkEvidenceSection artifacts={brief.workArtifacts} />
      <SignalSynthesisSection signals={brief.signalSynthesis} />
      <RisksUnknownsSection risks={brief.risksUnknowns} />
      <ValidationPlanSection plan={brief.validationPlan} />
      <FounderRecommendationSection recommendation={brief.recommendation} />
      <ActionLayerSection action={brief.actionLayer} />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16, delay: 0.35 }}
        className="py-10 border-t border-border text-center"
      >
        <p className="text-xs text-muted-foreground">
          HumIQ — Work Evidence Logic
        </p>
      </motion.footer>
    </motion.div>
  );
}
