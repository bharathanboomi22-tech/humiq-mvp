import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DiscoveryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: DiscoveryMessage;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isAssistant
            ? 'glass-card text-foreground'
            : 'bg-accent/10 text-foreground border border-accent/20'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};
