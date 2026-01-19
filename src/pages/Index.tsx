import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { LoadingExperience } from '@/components/LoadingExperience';
import { createWorkSession } from '@/lib/workSession';
import { toast } from 'sonner';

type ViewState = 'input' | 'loading';

const Index = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('input');
  const sessionIdRef = useRef<string | null>(null);
  const sessionReadyRef = useRef(false);
  const animationCompleteRef = useRef(false);

  // Check if we can navigate (both session ready and animation complete)
  const tryNavigate = useCallback(() => {
    if (sessionReadyRef.current && animationCompleteRef.current && sessionIdRef.current) {
      navigate(`/work-session/live/${sessionIdRef.current}`);
    }
  }, [navigate]);

  const handleSubmit = async (data: { 
    githubUrl: string; 
    otherLinks: string; 
  }) => {
    setViewState('loading');
    sessionReadyRef.current = false;
    animationCompleteRef.current = false;
    
    try {
      // Create work session with default parameters
      const result = await createWorkSession({
        githubUrl: data.githubUrl,
        roleTrack: 'backend', // Default
        level: 'mid', // Default
        duration: 5, // Demo mode
      });
      
      // Store session ID and GitHub URL
      sessionIdRef.current = result.sessionId;
      localStorage.setItem('humiq_github_url', data.githubUrl.trim());
      
      // Mark session as ready
      sessionReadyRef.current = true;
      tryNavigate();
    } catch (error) {
      console.error('Session creation failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('usage limit') || error.message.includes('credits')) {
          toast.error('AI usage limit reached. Please add credits to continue.');
        } else {
          toast.error(error.message || 'Failed to start session. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      setViewState('input');
    }
  };

  const handleLoadingComplete = useCallback(() => {
    animationCompleteRef.current = true;
    tryNavigate();
  }, [tryNavigate]);

  return (
    <main className="min-h-screen" style={{ background: '#0B0E12' }}>
      {viewState === 'input' && (
        <HeroSection onSubmit={handleSubmit} />
      )}
      
      {viewState === 'loading' && (
        <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24">
          <LoadingExperience onComplete={handleLoadingComplete} />
        </div>
      )}
    </main>
  );
};

export default Index;
