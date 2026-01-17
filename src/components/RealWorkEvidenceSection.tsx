import { WorkArtifact } from '@/types/brief';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface RealWorkEvidenceSectionProps {
  artifacts: WorkArtifact[];
}

export function RealWorkEvidenceSection({ artifacts }: RealWorkEvidenceSectionProps) {
  // Don't render if no artifacts
  if (!artifacts || artifacts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.04, ease: 'easeOut' }}
      className="py-12 border-t border-border"
    >
      <h2 className="font-display text-lg font-medium text-foreground mb-8">
        Real Work Evidence (Not Resume Claims)
      </h2>

      <div className="space-y-5">
        {artifacts.slice(0, 3).map((artifact, index) => (
          <motion.div
            key={artifact.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.06 + index * 0.03, ease: 'easeOut' }}
            className="group p-5 rounded-lg bg-card border border-border"
          >
            {/* Title and Link */}
            <div className="mb-4">
              <a
                href={artifact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium hover:text-accent transition-colors duration-100 inline-flex items-center gap-2"
              >
                {artifact.title}
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-100" />
              </a>
            </div>

            {/* What it is */}
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                What it is
              </p>
              <p className="text-sm text-foreground/75 leading-relaxed">
                {artifact.whatItIs}
              </p>
            </div>

            {/* Why it matters */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Why it matters
              </p>
              <p className="text-sm text-foreground/75 leading-relaxed">
                {artifact.whyItMatters}
              </p>
            </div>

            {/* Signals - max 2 */}
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