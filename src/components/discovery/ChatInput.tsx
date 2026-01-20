import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSubmit, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-card p-3 rounded-2xl">
      <div className="flex items-end gap-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Write naturally. This isn't a performance."}
          rows={1}
          className="flex-1 bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground text-sm leading-relaxed min-h-[24px] max-h-[200px]"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            size="icon"
            className={cn(
              input.trim() && !disabled
                ? 'bg-accent text-accent-foreground'
                : 'opacity-50 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-1">
        Write naturally. This isn't a performance.
      </p>
    </div>
  );
};
