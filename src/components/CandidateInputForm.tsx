import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Globe } from 'lucide-react';

interface CandidateInputFormProps {
  onSubmit: (data: { 
    githubUrl: string; 
    otherLinks: string; 
  }) => void;
  isLoading?: boolean;
}

export function CandidateInputForm({ onSubmit, isLoading }: CandidateInputFormProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [otherLinks, setOtherLinks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ githubUrl, otherLinks });
  };

  const isValid = githubUrl.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Module header */}
      <div className="text-center mb-2">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
          Work Evidence Brief
        </p>
        <p className="text-sm text-foreground/60">
          Under 60 seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* GitHub URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2.5">
              <Github className="w-4 h-4 text-muted-foreground transition-opacity duration-200 hover:opacity-80" />
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200"
            />
          </div>

          {/* Other Links (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2.5">
              <Globe className="w-4 h-4 text-muted-foreground transition-opacity duration-200 hover:opacity-80" />
              Other Links
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={otherLinks}
              onChange={(e) => setOtherLinks(e.target.value)}
              placeholder="Portfolio, LinkedIn, product demos..."
              className="w-full px-4 py-3.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          HumIQ evaluates verified work evidence.<br />
          If evidence is limited, it will clearly say so.
        </p>

        {/* Submit button - heavy, intentional feel */}
        <motion.button
          type="submit"
          disabled={!isValid || isLoading}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.1 }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-sm font-medium bg-accent text-accent-foreground disabled:opacity-35 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-accent/90"
          style={{
            boxShadow: isValid && !isLoading 
              ? '0 0 24px -6px rgba(124, 92, 255, 0.35)' 
              : 'none',
          }}
        >
          {isLoading ? (
            <span>Evaluating...</span>
          ) : (
            <>
              Evaluate Candidate
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
