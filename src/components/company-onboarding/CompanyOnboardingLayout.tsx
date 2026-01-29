import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyOnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  showProgress?: boolean;
}

export const CompanyOnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  showProgress = true,
}: CompanyOnboardingLayoutProps) => {
  const navigate = useNavigate();

  // Hide header on first step (Mode Shift)
  const showHeader = currentStep > 0;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,230,245,0.3) 50%, rgba(255,182,220,0.4) 80%, rgba(255,47,178,0.12) 100%)',
        }}
      />

      {/* Progress indicator header */}
      {showHeader && showProgress && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-semibold">Back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <span className="font-display text-lg font-extrabold text-foreground">
                  HumiQ
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-semibold">
                Hiring Intent
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      i < currentStep
                        ? 'w-6'
                        : i === currentStep
                        ? 'w-6 bg-foreground'
                        : 'w-4 bg-gray-200'
                    )}
                    style={i < currentStep ? {
                      background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                    } : {}}
                  />
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        "relative min-h-screen flex items-center justify-center",
        showHeader && showProgress ? "py-24 pt-28" : "py-12"
      )}>
        <div className="w-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};