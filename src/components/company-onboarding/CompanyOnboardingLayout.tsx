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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FC] via-[#F5F0FF] to-[#FFF5F7] relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#5B8CFF]/8 to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#B983FF]/8 to-transparent blur-3xl animate-float" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#FF8FB1]/6 to-transparent blur-3xl animate-float" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Progress indicator header */}
      {showHeader && showProgress && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/40 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                {/* AI Orb Logo */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1]" />
                <span className="font-display text-lg font-bold text-foreground">
                  HumiQ
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                Hiring Intent
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      i < currentStep
                        ? 'w-6 bg-gradient-to-r from-[#5B8CFF] to-[#B983FF]'
                        : i === currentStep
                        ? 'w-6 bg-foreground'
                        : 'w-4 bg-foreground/15'
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
