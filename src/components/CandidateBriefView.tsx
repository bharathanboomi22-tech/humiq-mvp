import { CandidateBrief } from '@/types/brief';
import { BriefHeader } from './BriefHeader';
import { WorkEvidenceSection } from './WorkEvidenceSection';
import { StrengthsRisksSection } from './StrengthsRisksSection';
import { InterviewPlanSection } from './InterviewPlanSection';
import { OutreachSection } from './OutreachSection';
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
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        New Brief
      </motion.button>

      {/* Brief content */}
      <BriefHeader brief={brief} />
      <WorkEvidenceSection evidence={brief.workEvidence} />
      <StrengthsRisksSection strengths={brief.strengths} risks={brief.risks} />
      <InterviewPlanSection plan={brief.interviewPlan} />
      <OutreachSection message={brief.outreachMessage} />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="py-12 border-t border-border text-center"
      >
        <p className="text-xs text-muted-foreground">
          HumIQ AI — Work Evidence Brief
        </p>
      </motion.footer>
    </motion.div>
  );
}
