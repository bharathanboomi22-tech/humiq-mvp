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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.08, ease: 'easeOut' }}
          className="section-header"
        >
          HumIQ
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.16, ease: 'easeOut' }}
          className="font-display text-2xl md:text-[28px] font-medium text-foreground leading-tight mb-4"
        >
          See how a Founding Engineer actually works, before you hire them.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.24, ease: 'easeOut' }}
          className="text-muted-foreground text-sm"
        >
          Work Evidence Brief • Under 60 seconds
        </motion.p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.32, ease: 'easeOut' }}
        onSubmit={handleSubmit} 
        className="space-y-5"
      >
        <div className="space-y-4">
          {/* GitHub URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2.5">
              <Github className="w-4 h-4 text-muted-foreground" />
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3.5 rounded-lg glass-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200"
            />
          </div>

          {/* Other Links (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Other Links
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={otherLinks}
              onChange={(e) => setOtherLinks(e.target.value)}
              placeholder="Portfolio, LinkedIn, product demos..."
              className="w-full px-4 py-3.5 rounded-lg glass-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          HumIQ evaluates verified work evidence.<br />
          If evidence is limited, it will clearly say so.
        </p>

        {/* Submit button with accent glow */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200 accent-glow"
        >
          {isLoading ? (
            <span>Evaluating...</span>
          ) : (
            <>
              Evaluate Candidate
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}
