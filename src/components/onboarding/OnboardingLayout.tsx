import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  stepLabel?: string;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  stepLabel,
}: OnboardingLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ambient">
      {/* Progress indicator */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {showBack && currentStep > 0 && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="text-lg font-display font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              HumIQ <span className="text-foreground/50">AI</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {stepLabel || `Step ${currentStep + 1} of ${totalSteps}`}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 w-6 rounded-full transition-colors',
                    i <= currentStep
                      ? 'bg-accent'
                      : 'bg-border/50'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative min-h-screen flex items-center justify-center px-6 py-16 md:py-24 pt-24">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
};
