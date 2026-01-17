import { WorkArtifact } from '@/types/brief';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface RealWorkEvidenceSectionProps {
  artifacts: WorkArtifact[];
}

export function RealWorkEvidenceSection({ artifacts }: RealWorkEvidenceSectionProps) {
  if (!artifacts || artifacts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className="mb-16"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
        Real Work Evidence
      </h2>

      <div className="space-y-8">
        {artifacts.slice(0, 3).map((artifact, index) => (
          <motion.article
            key={artifact.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.08 + index * 0.04 }}
            className="border-l border-border pl-6"
          >
            {/* Title with link */}
            <div className="mb-4">
              {artifact.url ? (
                <a
                  href={artifact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium inline-flex items-center gap-1.5 hover:text-accent transition-colors"
                >
                  {artifact.title}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </a>
              ) : (
                <span className="text-foreground font-medium">
                  {artifact.title}
                </span>
              )}
            </div>

            {/* What it is */}
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {artifact.whatItIs}
            </p>

            {/* Why it matters */}
            <p className="text-sm text-foreground/75 mb-4 leading-relaxed">
              {artifact.whyItMatters}
            </p>

            {/* Signals — max 2 */}
            {artifact.signals.length > 0 && (
              <div className="flex gap-2">
                {artifact.signals.slice(0, 2).map((signal, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground px-2 py-0.5 border border-border rounded"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}