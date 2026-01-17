import { WorkArtifact } from '@/types/brief';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface RealWorkEvidenceSectionProps {
  artifacts: WorkArtifact[];
}

export function RealWorkEvidenceSection({ artifacts }: RealWorkEvidenceSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: 0.05, ease: 'easeOut' }}
      className="py-10 border-t border-border"
    >
      <h2 className="font-display text-xl font-medium text-foreground mb-1">
        Real Work Evidence
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Not resume claims
      </p>

      <div className="space-y-6">
        {artifacts.slice(0, 3).map((artifact, index) => (
          <motion.div
            key={artifact.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, delay: 0.08 + index * 0.04, ease: 'easeOut' }}
            className="group p-5 rounded-lg bg-card border border-border hover:border-muted-foreground/30 transition-all duration-150"
          >
            {/* Title and Link */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <a
                href={artifact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium hover:text-accent transition-colors flex items-center gap-2"
              >
                {artifact.title}
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* What it is */}
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What it is
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {artifact.whatItIs}
              </p>
            </div>

            {/* Why it matters */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Why it matters (Founder Lens)
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {artifact.whyItMatters}
              </p>
            </div>

            {/* Signals */}
            <div className="flex flex-wrap gap-2">
              {artifact.signals.slice(0, 2).map((signal, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs bg-secondary text-secondary-foreground"
                >
                  {signal}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
