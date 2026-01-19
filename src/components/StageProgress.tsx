import { cn } from '@/lib/utils';
import { StageName, STAGE_CONFIG, STAGE_ORDER } from '@/types/workSession';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface StageProgressProps {
  currentStage: StageName;
  completedStages: StageName[];
  className?: string;
  stageOrder?: StageName[];
  stageConfig?: Record<string, { label: string; minMinutes: number; maxMinutes: number }>;
}

export function StageProgress({ 
  currentStage, 
  completedStages, 
  className,
  stageOrder = STAGE_ORDER,
  stageConfig = STAGE_CONFIG,
}: StageProgressProps) {
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stageOrder.map((stage, index) => {
        const isCompleted = completedStages.includes(stage);
        const isCurrent = stage === currentStage;
        const isPending = !isCompleted && !isCurrent;
        const config = stageConfig[stage] || { label: stage };

        return (
          <div key={stage} className="flex items-center">
            {/* Stage indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                  isCompleted && 'bg-verdict-interview/20',
                  isCurrent && 'bg-accent/20 ring-2 ring-accent/50',
                  isPending && 'bg-muted'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-verdict-interview" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                  isCompleted && 'text-verdict-interview',
                  isCurrent && 'text-accent',
                  isPending && 'text-muted-foreground'
                )}
              >
                {config.label}
              </span>
            </div>

            {/* Connector line */}
            {index < stageOrder.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1 mt-[-18px] transition-all duration-300',
                  index < currentIndex ? 'bg-verdict-interview' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Compact version for mobile
export function StageProgressCompact({ 
  currentStage, 
  completedStages, 
  className,
  stageOrder = STAGE_ORDER,
  stageConfig = STAGE_CONFIG,
}: StageProgressProps) {
  const currentIndex = stageOrder.indexOf(currentStage);
  const totalStages = stageOrder.length;
  const config = stageConfig[currentStage] || { label: currentStage };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((currentIndex + 1) / totalStages) * 100}%` }}
        />
      </div>
      
      {/* Stage label */}
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {config.label} ({currentIndex + 1}/{totalStages})
      </span>
    </div>
  );
}
