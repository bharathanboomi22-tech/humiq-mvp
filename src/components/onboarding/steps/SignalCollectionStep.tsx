import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Link2, Github, FileText, Globe, Upload, 
  Plus, X, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OnboardingData, WorkLink } from '@/hooks/useTalentOnboarding';

interface SignalCollectionStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  onSkipToChallenge: () => void;
  saving: boolean;
}

type SignalType = 'project' | 'github' | 'portfolio' | 'other' | null;

export function SignalCollectionStep({ 
  data, 
  updateField, 
  onNext, 
  onSkipToChallenge,
  saving 
}: SignalCollectionStepProps) {
  const [activeSignal, setActiveSignal] = useState<SignalType>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  const hasSignals = data.workLinks.length > 0;

  const addWorkLink = (type: 'github' | 'portfolio' | 'other', url: string, label?: string) => {
    if (!url.trim()) return;
    
    const newLink: WorkLink = { type, url: url.trim(), label };
    updateField('workLinks', [...data.workLinks, newLink]);
    
    // Reset form
    setLinkUrl('');
    setLinkLabel('');
    setActiveSignal(null);
  };

  const addProject = () => {
    if (!projectTitle.trim()) return;
    
    const newLink: WorkLink = { 
      type: 'other', 
      url: projectLink || 'project-entry',
      label: `${projectTitle}: ${projectDescription}`
    };
    updateField('workLinks', [...data.workLinks, newLink]);
    
    // Reset form
    setProjectTitle('');
    setProjectDescription('');
    setProjectLink('');
    setActiveSignal(null);
  };

  const removeLink = (index: number) => {
    const updated = data.workLinks.filter((_, i) => i !== index);
    updateField('workLinks', updated);
  };

  const signalOptions = [
    { 
      type: 'project' as SignalType, 
      icon: FolderOpen, 
      label: 'Project / Case Study',
      description: 'Share a project you worked on'
    },
    { 
      type: 'github' as SignalType, 
      icon: Github, 
      label: 'GitHub',
      description: 'Link your repositories'
    },
    { 
      type: 'portfolio' as SignalType, 
      icon: Globe, 
      label: 'Portfolio / Website',
      description: 'Your personal site'
    },
    { 
      type: 'other' as SignalType, 
      icon: Link2, 
      label: 'Other Link',
      description: 'Figma, Docs, Blog, etc.'
    },
  ];

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-3">
          Give me a place to start
        </h1>
        <p className="text-muted-foreground">
          Share anything that reflects how you work — or skip if nothing exists yet.
        </p>
      </motion.div>

      {/* AI Guidance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-accent/5 to-[#B983FF]/5 border border-accent/10"
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#B983FF] flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground/80 mb-1">Rough is fine. Real matters more than polished.</p>
            <p>I'm looking for decisions, not perfection.</p>
          </div>
        </div>
      </motion.div>

      {/* Added Signals */}
      <AnimatePresence>
        {data.workLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Label className="text-sm text-muted-foreground mb-3 block">Added signals</Label>
            <div className="space-y-2">
              {data.workLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-white/60"
                >
                  {link.type === 'github' && <Github className="w-4 h-4 text-muted-foreground" />}
                  {link.type === 'portfolio' && <Globe className="w-4 h-4 text-muted-foreground" />}
                  {link.type === 'other' && <Link2 className="w-4 h-4 text-muted-foreground" />}
                  <span className="flex-1 text-sm truncate">
                    {link.label || link.url}
                  </span>
                  <button
                    onClick={() => removeLink(index)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signal Type Selection */}
      {activeSignal === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 mb-6"
        >
          {signalOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setActiveSignal(option.type)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 hover:border-accent/20 transition-all duration-300 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <option.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </button>
          ))}
        </motion.div>
      )}

      {/* Project Form */}
      <AnimatePresence mode="wait">
        {activeSignal === 'project' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4 mb-6 p-5 rounded-2xl bg-white/70 border border-white/60"
          >
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Project / Case Study</Label>
              <button onClick={() => setActiveSignal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Input
              placeholder="Project title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-white/70"
            />
            <Textarea
              placeholder="Brief description — what problem did you solve?"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="bg-white/70 min-h-[80px]"
            />
            <Input
              placeholder="Link (optional)"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              className="bg-white/70"
            />
            <Button 
              onClick={addProject}
              disabled={!projectTitle.trim()}
              className="w-full"
            >
              Add Project
            </Button>
          </motion.div>
        )}

        {/* GitHub / Portfolio / Other Link Form */}
        {(activeSignal === 'github' || activeSignal === 'portfolio' || activeSignal === 'other') && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4 mb-6 p-5 rounded-2xl bg-white/70 border border-white/60"
          >
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">
                {activeSignal === 'github' && 'GitHub Profile'}
                {activeSignal === 'portfolio' && 'Portfolio / Website'}
                {activeSignal === 'other' && 'Other Link'}
              </Label>
              <button onClick={() => setActiveSignal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Input
              placeholder={
                activeSignal === 'github' 
                  ? 'https://github.com/username' 
                  : activeSignal === 'portfolio'
                  ? 'https://yoursite.com'
                  : 'https://...'
              }
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="bg-white/70"
            />
            {activeSignal === 'other' && (
              <Input
                placeholder="Label (e.g., Figma portfolio, Blog post)"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                className="bg-white/70"
              />
            )}
            <Button 
              onClick={() => addWorkLink(activeSignal, linkUrl, linkLabel)}
              disabled={!linkUrl.trim()}
              className="w-full"
            >
              Add Link
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <button
          onClick={onSkipToChallenge}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#5B8CFF]/5 to-[#B983FF]/5 border border-dashed border-accent/20 hover:border-accent/40 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="font-medium text-foreground">I don't have work to share yet</div>
              <div className="text-sm text-muted-foreground">Complete a quick micro-challenge instead</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </button>
      </motion.div>

      {/* Continue Button */}
      <Button
        onClick={onNext}
        disabled={saving}
        size="lg"
        className="w-full gap-2 bg-foreground hover:bg-foreground/90 text-background"
      >
        {saving ? 'Saving...' : 'Continue'}
        <ArrowRight className="w-4 h-4" />
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        {hasSignals ? `${data.workLinks.length} signal${data.workLinks.length > 1 ? 's' : ''} added` : 'You can add more signals later'}
      </p>
    </div>
  );
}
