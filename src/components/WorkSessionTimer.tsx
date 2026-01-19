import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WorkSessionTimerProps {
  startedAt: Date;
  duration: number; // in minutes
  className?: string;
  onTimeWarning?: () => void;
  onTimeExpired?: () => void;
}

export function WorkSessionTimer({
  startedAt,
  duration,
  className,
  onTimeWarning,
  onTimeExpired,
}: WorkSessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);

  const totalSeconds = duration * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = (elapsed / totalSeconds) * 100;

  const isWarning = remaining <= 300 && remaining > 0; // 5 min warning
  const isExpired = remaining === 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (isWarning && !hasWarned && onTimeWarning) {
      setHasWarned(true);
      onTimeWarning();
    }
  }, [isWarning, hasWarned, onTimeWarning]);

  useEffect(() => {
    if (isExpired && !hasExpired && onTimeExpired) {
      setHasExpired(true);
      onTimeExpired();
    }
  }, [isExpired, hasExpired, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Circular progress indicator */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${progress} 100`}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000',
              isExpired ? 'text-destructive' : isWarning ? 'text-verdict-caution' : 'text-accent'
            )}
          />
        </svg>
        {/* Timer icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              isExpired ? 'text-destructive' : isWarning ? 'text-verdict-caution' : 'text-muted-foreground'
            )}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>

      {/* Time display */}
      <div className="flex flex-col">
        <span
          className={cn(
            'font-mono text-lg font-semibold tabular-nums',
            isExpired ? 'text-destructive' : isWarning ? 'text-verdict-caution' : 'text-foreground'
          )}
        >
          {formatTime(remaining)}
        </span>
        <span className="text-xs text-muted-foreground">
          {isExpired ? 'Time expired' : isWarning ? 'Wrapping up' : 'remaining'}
        </span>
      </div>
    </div>
  );
}
