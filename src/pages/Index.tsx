import { useState } from 'react';
import { CandidateInputForm } from '@/components/CandidateInputForm';
import { CandidateBriefView } from '@/components/CandidateBriefView';
import { LoadingExperience } from '@/components/LoadingExperience';
import { CandidateBrief } from '@/types/brief';
import { analyzeCandidate } from '@/lib/analyzeCandidate';
import { toast } from 'sonner';

type ViewState = 'input' | 'loading' | 'brief';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [brief, setBrief] = useState<CandidateBrief | null>(null);

  const handleSubmit = async (data: { 
    githubUrl: string; 
    otherLinks: string; 
    rawWorkEvidence: string;
  }) => {
    setViewState('loading');
    
    try {
      const result = await analyzeCandidate({
        linkedinUrl: '', // Deprecated - now using otherLinks
        githubUrl: data.githubUrl,
        websiteUrl: data.otherLinks || undefined,
        rawWorkEvidence: data.rawWorkEvidence,
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
          <LoadingExperience />
        )}
        
        {viewState === 'brief' && brief && (
          <CandidateBriefView brief={brief} onBack={handleBack} />
        )}
      </div>
    </main>
  );
};

export default Index;
