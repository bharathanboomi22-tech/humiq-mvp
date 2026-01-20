import { OnboardingCard } from '../OnboardingCard';
import { OnboardingData, WorkLink } from '@/hooks/useTalentOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Github, Globe, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkLinksStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  onSkip: () => void;
  saving: boolean;
}

export const WorkLinksStep = ({ data, updateField, onNext, onSkip, saving }: WorkLinksStepProps) => {
  const addLink = (type: WorkLink['type']) => {
    updateField('workLinks', [
      ...data.workLinks,
      { type, url: '', label: type === 'other' ? '' : undefined },
    ]);
  };

  const removeLink = (index: number) => {
    updateField('workLinks', data.workLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof WorkLink, value: string) => {
    const updated = data.workLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    updateField('workLinks', updated);
  };

  const getLinkIcon = (type: WorkLink['type']) => {
    switch (type) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'portfolio':
        return <Globe className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <OnboardingCard>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Work Links</h2>
      <p className="text-muted-foreground text-sm mb-2">
        Share links to your work (optional).
      </p>
      <p className="text-xs text-muted-foreground/70 mb-6">
        GitHub, portfolio, or other projects you've worked on.
      </p>

      <div className="space-y-4">
        {data.workLinks.map((link, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-border bg-background/50 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {getLinkIcon(link.type)}
                <span className="text-sm font-medium text-foreground capitalize">{link.type}</span>
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {link.type === 'other' && (
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  placeholder="e.g., Personal Blog"
                  className="mt-1 bg-background/50"
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder={link.type === 'github' ? 'https://github.com/username' : 'https://...'}
                className="mt-1 bg-background/50"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addLink('github')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border border-border bg-background/50',
              'text-muted-foreground hover:border-accent/30 hover:text-foreground',
              'transition-colors flex items-center justify-center gap-2'
            )}
          >
            <Github className="w-4 h-4" />
            Add GitHub
          </button>
          <button
            type="button"
            onClick={() => addLink('portfolio')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border border-border bg-background/50',
              'text-muted-foreground hover:border-accent/30 hover:text-foreground',
              'transition-colors flex items-center justify-center gap-2'
            )}
          >
            <Globe className="w-4 h-4" />
            Add Portfolio
          </button>
          <button
            type="button"
            onClick={() => addLink('other')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl border border-border bg-background/50',
              'text-muted-foreground hover:border-accent/30 hover:text-foreground',
              'transition-colors flex items-center justify-center gap-2'
            )}
          >
            <LinkIcon className="w-4 h-4" />
            Other
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={onSkip} variant="outline" className="flex-1">
          Skip for now
        </Button>
        <Button onClick={onNext} disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </OnboardingCard>
  );
};
