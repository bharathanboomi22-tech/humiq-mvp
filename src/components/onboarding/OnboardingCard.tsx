import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingCardProps {
  children: ReactNode;
  className?: string;
}

export const OnboardingCard = ({ children, className = '' }: OnboardingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 md:p-8',
        className
      )}
    >
      {children}
    </motion.div>
  );
};