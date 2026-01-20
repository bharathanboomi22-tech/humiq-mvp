import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, DiscoveryMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';

interface DiscoveryChatProps {
  messages: DiscoveryMessage[];
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  isComplete: boolean;
  currentQuestion: number;
  totalQuestions: number;
}

export const DiscoveryChat = ({
  messages,
  onSubmit,
  isLoading,
  isComplete,
  currentQuestion,
  totalQuestions,
}: DiscoveryChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1 bg-border/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 rounded-2xl">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      {!isComplete && (
        <ChatInput onSubmit={onSubmit} disabled={isLoading} />
      )}
    </div>
  );
};
