import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';

export const InterviewsInProgressState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-12 text-center"
  >
    <div className="w-16 h-16 rounded-full cognitive-gradient mx-auto mb-6 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-7 h-7 text-white" />
      </motion.div>
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-3">
      Understanding is in progress
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto">
      HumiQ is interviewing and synthesizing real work signals.
      <br />
      You don't need to do anything.
    </p>
  </motion.div>
);

export const NoStrongHiresState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-12 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-foreground/5 mx-auto mb-6 flex items-center justify-center">
      <Search className="w-7 h-7 text-foreground/60" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-3">
      No clear decision yet
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto">
      This role's constraints are narrow.
      <br />
      HumiQ will expand discovery or suggest adjustments.
    </p>
  </motion.div>
);
