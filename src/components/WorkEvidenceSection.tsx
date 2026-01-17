import { WorkEvidence } from '@/types/brief';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, Globe, FileText, Play } from 'lucide-react';

interface WorkEvidenceSectionProps {
  evidence: WorkEvidence[];
}

const typeIcons = {
  repo: GitBranch,
  product: Globe,
  blog: FileText,
  demo: Play,
};

const typeLabels = {
  repo: 'Repository',
  product: 'Shipped Product',
  blog: 'Technical Writing',
  demo: 'Live Demo',
};

export function WorkEvidenceSection({ evidence }: WorkEvidenceSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="py-12"
    >
      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
        Real Work Evidence
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Concrete artifacts that demonstrate capability
      </p>

      <div className="space-y-6">
        {evidence.map((item, index) => {
          const Icon = typeIcons[item.type];
          return (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
              className="group block p-6 rounded-lg bg-card border border-border hover:border-foreground/20 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {typeLabels[item.type]}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.section>
  );
}
