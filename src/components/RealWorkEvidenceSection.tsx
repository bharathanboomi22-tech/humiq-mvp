import { WorkArtifact } from '@/types/brief';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface RealWorkEvidenceSectionProps {
  artifacts: WorkArtifact[];
}

export function RealWorkEvidenceSection({ artifacts }: RealWorkEvidenceSectionProps) {
  if (!artifacts || artifacts.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="section-header">
        Real Work Evidence
      </h2>

      <div className="space-y-4">
        {artifacts.slice(0, 3).map((artifact, index) => (
          <motion.article
            key={artifact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.08, ease: 'easeOut' }}
            className="glass-card-hover p-6"
          >
            {/* Title with link */}
            <div className="mb-4">
              {artifact.url ? (
                <a
                  href={artifact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium text-base inline-flex items-center gap-2 hover:text-accent transition-colors duration-200"
                >
                  {artifact.title}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              ) : (
                <span className="text-foreground font-medium text-base">
                  {artifact.title}
                </span>
              )}
            </div>

            {/* What it is */}
            <p className="text-[15px] text-muted-foreground mb-3 leading-relaxed max-w-[65ch]">
              {artifact.whatItIs}
            </p>

            {/* Why it matters */}
            <p className="text-[15px] text-foreground/85 mb-4 leading-relaxed max-w-[65ch]">
              {artifact.whyItMatters}
            </p>

            {/* Signals — subtle tags */}
            {artifact.signals.length > 0 && (
              <div className="flex gap-2">
                {artifact.signals.slice(0, 2).map((signal, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground px-3 py-1.5 bg-secondary rounded-md"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
