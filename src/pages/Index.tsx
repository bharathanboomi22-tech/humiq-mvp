import { useState } from 'react';
import { CandidateInputForm } from '@/components/CandidateInputForm';
import { CandidateBriefView } from '@/components/CandidateBriefView';
import { mockBrief } from '@/data/mockBrief';
import { CandidateBrief } from '@/types/brief';

type ViewState = 'input' | 'loading' | 'brief';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [brief, setBrief] = useState<CandidateBrief | null>(null);

  const handleSubmit = async (data: { linkedinUrl: string; githubUrl: string; websiteUrl: string }) => {
    setViewState('loading');
    
    // Simulate API call - in production, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use mock data for demo
    setBrief(mockBrief);
    setViewState('brief');
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
            <p className="text-muted-foreground text-sm">Analyzing work evidence...</p>
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
