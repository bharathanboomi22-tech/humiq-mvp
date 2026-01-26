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

const staggerDelay = 0.08;

export function CandidateBriefView({ brief, onBack }: CandidateBriefViewProps) {
  const isInsufficientEvidence = 
    brief.verdict === 'fail' &&
    (!brief.workArtifacts || brief.workArtifacts.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="max-w-2xl mx-auto"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onBack}
        className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-16 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: staggerDelay * 1, ease: 'easeOut' }}
          >
            <RealWorkEvidenceSection artifacts={brief.workArtifacts} />
          </motion.div>
          
          {/* 2) Signal Synthesis */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: staggerDelay * 2, ease: 'easeOut' }}
          >
            <SignalSynthesisSection signals={brief.signalSynthesis} />
          </motion.div>
          
          {/* 3) Risks & Unknowns */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: staggerDelay * 3, ease: 'easeOut' }}
          >
            <RisksUnknownsSection risks={brief.risksUnknowns} />
          </motion.div>
        </>
      )}
      
      {/* 4) Validation Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: staggerDelay * 4, ease: 'easeOut' }}
      >
        <ValidationPlanSection plan={brief.validationPlan} />
      </motion.div>
      
      {/* 5) Founder Recommendation */}
      {!isInsufficientEvidence && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: staggerDelay * 5, ease: 'easeOut' }}
        >
          <FounderRecommendationSection recommendation={brief.recommendation} />
        </motion.div>
      )}

      {/* 6) Action Section — collapsible */}
      {!isInsufficientEvidence && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: staggerDelay * 6, ease: 'easeOut' }}
        >
          <ActionSection candidateName={brief.candidateName} />
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, delay: staggerDelay * 7, ease: 'easeOut' }}
        className="pt-16 pb-8 border-t border-border"
      >
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          HumiQ
        </p>
      </motion.footer>
    </motion.div>
  );
}
