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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-20"
    >
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/90 mb-10">
        Real Work Evidence
      </h2>

      <div className="space-y-10">
        {artifacts.slice(0, 3).map((artifact, index) => (
          <motion.article
            key={artifact.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: 0.06 + index * 0.03, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-l-2 border-border pl-7 py-1 hover:border-accent/40 transition-colors duration-150"
          >
            {/* Title with link — clearly scannable */}
            <div className="mb-5">
              {artifact.url ? (
                <a
                  href={artifact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium inline-flex items-center gap-2 hover:text-accent transition-colors duration-150"
                >
                  {artifact.title}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              ) : (
                <span className="text-foreground font-medium">
                  {artifact.title}
                </span>
              )}
            </div>

            {/* What it is — visually distinct */}
            <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">
              {artifact.whatItIs}
            </p>

            {/* Why it matters — slightly more prominent */}
            <p className="text-[15px] text-foreground/80 mb-5 leading-relaxed">
              {artifact.whyItMatters}
            </p>

            {/* Signals — subtle, low-contrast, never dominant */}
            {artifact.signals.length > 0 && (
              <div className="flex gap-2.5">
                {artifact.signals.slice(0, 2).map((signal, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground/70 px-2.5 py-1 bg-secondary/50 rounded-md"
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