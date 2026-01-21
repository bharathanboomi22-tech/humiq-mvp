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
    <div className="min-h-screen blush-gradient">
      {/* Progress indicator */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/60 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {showBack && currentStep > 0 && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="font-display text-lg font-bold text-foreground hover:opacity-80 transition-opacity duration-400"
            >
              HumIQ
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {stepLabel || `Step ${currentStep + 1} of ${totalSteps}`}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-6 rounded-full transition-all duration-400',
                    i <= currentStep
                      ? 'bg-foreground'
                      : 'bg-foreground/15'
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