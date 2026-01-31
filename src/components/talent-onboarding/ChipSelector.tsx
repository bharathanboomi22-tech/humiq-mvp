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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option, idx) => {
        const isSelected = selected.includes(option);
        return (
          <motion.button
            key={option}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(option)}
            className={cn(
              "metaview-chip",
              isSelected && "active"
            )}
          >
            {option}
          </motion.button>
        );
      })}
    </div>
  );
};
