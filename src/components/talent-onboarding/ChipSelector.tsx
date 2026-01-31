import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export const ChipSelector = ({
  options,
  selected,
  onChange,
  multiSelect = true,
  className,
}: ChipSelectorProps) => {
  const handleSelect = (option: string) => {
    if (multiSelect) {
      if (selected.includes(option)) {
        onChange(selected.filter(s => s !== option));
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-wrap gap-2.5", className)}
    >
      {options.map((option, idx) => {
        const isSelected = selected.includes(option);
        return (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => handleSelect(option)}
            className={cn(
              "chip",
              isSelected && "active"
            )}
          >
            {option}
          </motion.button>
        );
      })}
    </motion.div>
  );
};
