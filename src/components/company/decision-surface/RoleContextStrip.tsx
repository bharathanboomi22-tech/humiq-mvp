import { motion } from 'framer-motion';
import { Target, CheckCircle2, Loader2 } from 'lucide-react';
import { RoleContext } from './types';
import { cn } from '@/lib/utils';

interface RoleContextStripProps {
  role: RoleContext;
}

export const RoleContextStrip = ({ role }: RoleContextStripProps) => {
  const isComplete = role.interviewStatus === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card px-5 py-3 flex items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
          <Target className="w-4 h-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Hiring for</p>
          <p className="font-medium text-foreground">
            {role.title}
            <span className="text-muted-foreground font-normal"> — {role.primaryOutcome}</span>
          </p>
        </div>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          isComplete
            ? 'bg-emerald-100/80 text-emerald-700'
            : 'bg-amber-100/80 text-amber-700'
        )}
      >
        {isComplete ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI interviews complete
          </>
        ) : (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            AI interviews in progress
          </>
        )}
      </div>
    </motion.div>
  );
};
