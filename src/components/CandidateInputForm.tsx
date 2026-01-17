import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Linkedin, Github, Globe } from 'lucide-react';

interface CandidateInputFormProps {
  onSubmit: (data: { linkedinUrl: string; githubUrl: string; websiteUrl: string }) => void;
  isLoading?: boolean;
}

export function CandidateInputForm({ onSubmit, isLoading }: CandidateInputFormProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ linkedinUrl, githubUrl, websiteUrl });
  };

  const isValid = linkedinUrl.trim() !== '' || githubUrl.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          HumIQ
        </p>
        <h1 className="font-display text-2xl md:text-[28px] font-medium text-foreground leading-tight mb-4">
          See how a Founding Engineer actually works, before you hire them.
        </h1>
        <p className="text-muted-foreground text-sm">
          Work Evidence Brief • Under 60 seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* GitHub URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              GitHub
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all duration-100"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
              <Linkedin className="w-4 h-4 text-muted-foreground" />
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all duration-100"
            />
          </div>

          {/* Website URL (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Portfolio / Product
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all duration-100"
            />
          </div>
        </div>

        {/* Helper text - exact copy */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          HumIQ evaluates verified work evidence.<br />
          If evidence is limited, it will clearly say so.
        </p>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-100"
        >
          {isLoading ? (
            <span>Evaluating...</span>
          ) : (
            <>
              Evaluate
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}