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
      {/* Cognitive Field ambient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 1) 0%,
              rgba(146, 246, 240, 0.15) 35%,
              rgba(143, 242, 255, 0.20) 55%,
              rgba(103, 237, 250, 0.25) 75%,
              rgba(255, 255, 255, 1) 100%
            )
          `,
        }}
      />
      
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(143, 242, 255, 0.15) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full animate-float"
          style={{
            animationDelay: '-5s',
            background: 'radial-gradient(circle, rgba(146, 246, 240, 0.12) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full animate-float"
          style={{
            animationDelay: '-10s',
            background: 'radial-gradient(circle, rgba(103, 237, 250, 0.10) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Progress indicator - only show after first step */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/40 backdrop-blur-lg border-b border-white/20">
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
                {/* AI Orb Logo */}
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #8ff2ff 0%, #92f6f0 50%, #67edfa 100%)',
                  }}
                />
                <span className="font-display text-lg font-bold text-foreground">
                  HumiQ
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
                        ? 'w-6'
                        : i === currentStep - 1
                        ? 'w-6 bg-foreground'
                        : 'w-4 bg-foreground/15'
                    )}
                    style={i < currentStep ? {
                      background: 'linear-gradient(135deg, #8ff2ff 0%, #67edfa 100%)',
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
