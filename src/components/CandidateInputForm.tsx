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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
          HumIQ AI
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
          Work Evidence Brief
        </h1>
        <p className="text-muted-foreground text-lg">
          Decide Hire / Pass / Needs Signal in under 5 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* LinkedIn URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Github className="w-4 h-4" />
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Website URL (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Globe className="w-4 h-4" />
              Personal Website
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Role indicator */}
        <div className="flex items-center justify-center gap-2 py-3">
          <span className="text-sm text-muted-foreground">Role:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            Founding Engineer
          </span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span>Generating Brief...</span>
          ) : (
            <>
              Generate Brief
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Analysis typically takes 30-60 seconds
        </p>
      </form>
    </motion.div>
  );
}
