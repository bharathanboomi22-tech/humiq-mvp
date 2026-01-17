import { useState } from 'react';
import { CandidateInputForm } from '@/components/CandidateInputForm';
import { CandidateBriefView } from '@/components/CandidateBriefView';
import { CandidateBrief } from '@/types/brief';
import { analyzeCandidate } from '@/lib/analyzeCandidate';
import { toast } from 'sonner';

type ViewState = 'input' | 'loading' | 'brief';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [brief, setBrief] = useState<CandidateBrief | null>(null);

  const handleSubmit = async (data: { linkedinUrl: string; githubUrl: string; websiteUrl: string }) => {
    setViewState('loading');
    
    try {
      const result = await analyzeCandidate({
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        websiteUrl: data.websiteUrl || undefined,
      });
      
      setBrief(result);
      setViewState('brief');
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('usage limit') || error.message.includes('credits')) {
          toast.error('AI usage limit reached. Please add credits to continue.');
        } else {
          toast.error(error.message || 'Failed to analyze candidate. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      setViewState('input');
    }
  };

  const handleBack = () => {
    setViewState('input');
    setBrief(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-20">
        {viewState === 'input' && (
          <CandidateInputForm onSubmit={handleSubmit} />
        )}
        
        {viewState === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-6 h-6 border-2 border-muted border-t-accent rounded-full animate-spin mb-4" />
            <p className="text-foreground text-sm mb-1">Analyzing work evidence...</p>
            <p className="text-muted-foreground text-xs">This may take 30–60 seconds</p>
          </div>
        )}
        
        {viewState === 'brief' && brief && (
          <CandidateBriefView brief={brief} onBack={handleBack} />
        )}
      </div>
    </main>
  );
};

export default Index;
