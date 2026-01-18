import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Github, Globe, Shield, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CandidateInputFormProps {
  onSubmit: (data: { 
    githubUrl: string; 
    otherLinks: string; 
    rawWorkEvidence: string;
  }) => void;
  isLoading?: boolean;
}

export function CandidateInputForm({ onSubmit, isLoading }: CandidateInputFormProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [otherLinks, setOtherLinks] = useState('');
  const [rawWorkEvidence, setRawWorkEvidence] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isFetchingEvidence, setIsFetchingEvidence] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsAdminMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ githubUrl, otherLinks, rawWorkEvidence });
  };

  const handleFetchEvidence = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub URL first');
      return;
    }

    setIsFetchingEvidence(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-evidence', {
        body: { githubUrl: githubUrl.trim() },
      });

      if (error) throw error;

      if (data.rawEvidence) {
        setRawWorkEvidence(prev => 
          prev ? `${prev}\n\n---\n\n${data.rawEvidence}` : data.rawEvidence
        );
        toast.success(`Fetched evidence from ${data.repoCount} repositories`);
      } else {
        toast.warning('No README content found in public repositories');
      }
    } catch (error: any) {
      console.error('Error fetching evidence:', error);
      toast.error(error.message || 'Failed to fetch GitHub evidence');
    } finally {
      setIsFetchingEvidence(false);
    }
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
          className="section-header cursor-default select-none"
          onClick={(e) => {
            if (e.detail === 3) {
              setIsAdminMode(prev => !prev);
            }
          }}
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
        {/* Admin Mode Indicator */}
        <AnimatePresence>
          {isAdminMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass-card border-accent/30"
            >
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent font-medium">Admin Mode</span>
            </motion.div>
          )}
        </AnimatePresence>

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

          {/* Raw Work Evidence - Admin Only */}
          <AnimatePresence>
            {isAdminMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-foreground/80">
                    Raw Work Evidence
                    <span className="text-accent text-xs">(admin only)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchEvidence}
                    disabled={isFetchingEvidence || !githubUrl.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md glass-card text-accent border-accent/20 hover:border-accent/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isFetchingEvidence ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        Fetch Evidence
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={rawWorkEvidence}
                  onChange={(e) => setRawWorkEvidence(e.target.value)}
                  placeholder="Paste README content, repo descriptions, case studies, blog excerpts..."
                  rows={8}
                  className="w-full px-4 py-3.5 rounded-lg glass-card border-accent/20 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200 resize-y font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This field powers AI evaluation. Paste verified work evidence only.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
