import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntroStepProps {
  onContinue: () => void;
}

export function IntroStep({ onContinue }: IntroStepProps) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 mb-8"
      >
        <Sparkles className="w-10 h-10 text-accent" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4"
      >
        Welcome to HumIQ
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground max-w-md mx-auto mb-8"
      >
        Let's create your profile. This will help us understand who you are and match you with the right opportunities.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-10 text-left max-w-sm mx-auto"
      >
        {[
          'Tell us about yourself',
          'Share your experience and preferences',
          'Have a discovery conversation with our AI',
          'Get matched with opportunities',
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent shrink-0" />
            <span className="text-foreground/80">{item}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button onClick={onContinue} size="lg" className="gap-2">
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground mt-8"
      >
        Takes about 5 minutes to complete
      </motion.p>
    </div>
  );
}
