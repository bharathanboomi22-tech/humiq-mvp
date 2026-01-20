import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { HeroSection } from '@/components/HeroSection';
import { LoveLettersSection } from '@/components/LoveLettersSection';
import { LoadingExperience } from '@/components/LoadingExperience';
import { createWorkSession, completeSession } from '@/lib/workSession';

type ViewState = 'input' | 'loading';

const Index = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('input');
  
  // Track both conditions
  const sessionReadyRef = useRef(false);
  const animationCompleteRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const tryNavigate = useCallback(() => {
    // Navigate directly to evidence pack when both session and animation are ready
    if (sessionReadyRef.current && animationCompleteRef.current && sessionIdRef.current) {
      navigate(`/evidence-pack/${sessionIdRef.current}`);
    }
  }, [navigate]);

  const handleSubmit = async (data: { githubUrl: string; otherLinks: string }) => {
    setViewState('loading');
    sessionReadyRef.current = false;
    animationCompleteRef.current = false;
    
    // Store the GitHub URL for later use
    localStorage.setItem('humiq_github_url', data.githubUrl);
    
    try {
      // Step 1: Create work session and fetch GitHub data
      const { sessionId } = await createWorkSession({
        githubUrl: data.githubUrl,
        roleTrack: 'backend',
        level: 'mid',
        duration: 5,
      });
      
      sessionIdRef.current = sessionId;
      
      // Step 2: Complete the session immediately to generate evidence pack
      await completeSession(sessionId);
      
      sessionReadyRef.current = true;
      tryNavigate();
    } catch (err) {
      console.error('Error during evaluation:', err);
      setViewState('input');
      
      const message = err instanceof Error ? err.message : 'Unknown error';
      
      if (message.includes('rate') || message.includes('429')) {
        toast.error('Rate limit reached. Please try again in a moment.');
      } else if (message.includes('credits') || message.includes('402')) {
        toast.error('AI credits depleted. Please try again later.');
      } else {
        toast.error('Evaluation failed. Please try again.');
      }
    }
  };

  const handleLoadingComplete = useCallback(() => {
    animationCompleteRef.current = true;
    tryNavigate();
  }, [tryNavigate]);

  // When in loading state, show the loading experience
  if (viewState === 'loading') {
    return (
      <main className="min-h-screen" style={{ background: '#0B0E12' }}>
        <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24">
          <LoadingExperience onComplete={handleLoadingComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: '#0B0E12' }}>
      <HeroSection 
        onSubmit={handleSubmit}
        isLoading={false}
      />
      <LoveLettersSection />
    </main>
  );
};

export default Index;
