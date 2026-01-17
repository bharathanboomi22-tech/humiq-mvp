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

  const isValid = linkedinUrl.trim() !== '' && githubUrl.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-12">
        <p className="text-sm text-muted-foreground mb-3">
          HumIQ
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-3 leading-tight">
          See how Founding Engineer actually works, before you hire them.
        </h1>
        <p className="text-muted-foreground text-base">
          Founding Engineer judgment in under 5 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground mb-2">
              <Linkedin className="w-4 h-4 text-muted-foreground" />
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
              required
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground mb-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              GitHub
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
              required
            />
          </div>

          {/* Website URL (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground mb-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Personal site
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span>Analyzing...</span>
          ) : (
            <>
              Analyze Evidence
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Takes 30–60 seconds
        </p>
      </form>
    </motion.div>
  );
}
