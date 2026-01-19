import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Figma, FileText, FolderOpen, Wrench } from 'lucide-react';

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
      {/* Card Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-lg md:text-xl font-medium leading-relaxed tracking-[-0.01em] text-foreground/90">
          See how candidates actually work — before you hire them.
        </h2>
        <p className="text-sm text-muted-foreground">
          HumIQ adapts to the role and the evidence available.
        </p>
      </div>

      {/* Evidence Types Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-5">
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Github className="w-4 h-4 text-foreground/40" />
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Figma className="w-4 h-4 text-foreground/40" />
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <FileText className="w-4 h-4 text-foreground/40" />
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <FolderOpen className="w-4 h-4 text-foreground/40" />
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Wrench className="w-4 h-4 text-foreground/40" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70 text-center">
          Different roles demonstrate work in different ways.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Active Demo Input */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-foreground/70 mb-2.5">
              <Github className="w-4 h-4 text-muted-foreground" />
              Example: Engineering work
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="Paste a GitHub PR or repository"
              className="w-full px-4 py-3.5 rounded-lg bg-white/[0.03] border-0 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
              This is one example. HumIQ works with many forms of real work.
            </p>
          </div>
        </div>

        {/* HumIQ Intelligence Signal */}
        <div className="space-y-2 pt-2">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground/50 text-center">
            HumIQ AI observes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="text-xs text-foreground/40">• Decisions</span>
            <span className="text-xs text-foreground/40">• Ownership</span>
            <span className="text-xs text-foreground/40">• Tradeoffs</span>
            <span className="text-xs text-foreground/40">• Execution</span>
          </div>
        </div>

        {/* Submit button - UNCHANGED */}
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

      {/* Footnote Trust Signal */}
      <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed pt-1">
        HumIQ evaluates real work evidence. If evidence is limited, it will clearly say so.
      </p>
    </div>
  );
}
