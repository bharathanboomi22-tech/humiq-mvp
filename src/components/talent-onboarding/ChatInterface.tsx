import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from './types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  helperActions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  quickActions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary';
    onClick: () => void;
  }>;
  placeholder?: string;
  showInput?: boolean;
  inputDisabled?: boolean;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  isTyping = false,
  helperActions,
  quickActions,
  placeholder = 'Type your response...',
  showInput = true,
  inputDisabled = false,
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      // Max height of ~200px (about 8 lines)
      inputRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Smooth auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Auto-scroll when messages change or typing indicator appears
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = () => {
    if (inputValue.trim() && !inputDisabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get only the most recent messages for minimal view (last 3-4)
  const visibleMessages = messages.slice(-4);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-xl font-semibold text-foreground text-glow">
          HumiQ AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Let's see how you work
        </p>
      </div>

      {/* Messages - scrollable area with padding for fixed input */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-4 scroll-smooth pb-48"
      >
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLatest={index === visibleMessages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mt-6"
          >
            <div className="px-4 py-3 rounded-2xl bg-secondary/30">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-[pulse_1.4s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-primary animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
                <span className="w-2 h-2 rounded-full bg-primary animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick action buttons */}
        {quickActions && quickActions.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 pt-6"
          >
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  action.variant === 'primary' 
                    ? "btn-primary"
                    : "btn-secondary"
                )}
              >
                {action.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Fixed Input Area at Bottom */}
      {showInput && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12">
          {/* Helper actions */}
          {helperActions && helperActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {helperActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar - expandable */}
          <div className="relative glass-card rounded-2xl border border-border/30">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={inputDisabled}
              rows={1}
              className={cn(
                "w-full bg-transparent px-4 py-4 pr-24 resize-none",
                "text-sm leading-relaxed min-h-[52px] max-h-[200px]",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-0",
                inputDisabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ overflow: 'hidden' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || inputDisabled}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  inputValue.trim() && !inputDisabled
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground"
                )}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

const MessageBubble = ({ message, isLatest }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "mb-6",
        isAssistant ? "" : "flex justify-end"
      )}
    >
      {/* Clean, full-width message without card background */}
      <div
        className={cn(
          "max-w-[90%] text-sm leading-relaxed",
          isAssistant 
            ? "text-foreground"
            : "text-foreground/90"
        )}
      >
        {/* Subtle role indicator */}
        <div className={cn(
          "text-xs mb-2 font-medium",
          isAssistant ? "text-primary" : "text-muted-foreground"
        )}>
          {isAssistant ? 'HumiQ' : 'You'}
        </div>
        
        {/* Message content - clean without bubble */}
        <p className={cn(
          "whitespace-pre-wrap",
          isAssistant && isLatest && "animate-fade-up"
        )}>
          {message.content}
        </p>
        
        {/* Subtle separator for visual distinction */}
        {!isLatest && (
          <div className="mt-4 border-b border-border/10" />
        )}
      </div>
    </motion.div>
  );
};
