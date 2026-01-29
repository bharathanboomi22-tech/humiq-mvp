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

  // Hide header on first step (Safety step)
  const showHeader = currentStep > 0;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Progress indicator - only show after first step */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <span className="font-display text-lg font-bold text-foreground">
                  HumiQ
                </span>
                <span className="text-[10px] font-medium text-pink-vibrant px-1 py-0.5 rounded bg-pink-wash">
                  Beta
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              {stepLabel && (
                <span className="text-xs text-muted-foreground font-medium">
                  {stepLabel}
                </span>
              )}
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      i < currentStep
                        ? 'w-6 bg-pink-vibrant'
                        : i === currentStep - 1
                        ? 'w-6 bg-foreground'
                        : 'w-4 bg-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        "relative min-h-screen flex items-center justify-center px-6",
        showHeader ? "py-24 pt-28" : "py-12"
      )}>
        <div className="w-full max-w-2xl relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};