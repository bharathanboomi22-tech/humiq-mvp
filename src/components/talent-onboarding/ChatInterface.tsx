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
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-xl font-semibold text-foreground text-glow">
          HumiQ AI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Let's see how you work
        </p>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="glass-card-elevated px-4 py-3 rounded-2xl">
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
            className="flex flex-wrap gap-3 pt-4"
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {showInput && (
        <div className="flex-shrink-0 p-6 border-t border-border/20">
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

          {/* Input bar */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={inputDisabled}
              rows={1}
              className={cn(
                "w-full input-field px-4 py-3 pr-24 resize-none",
                "text-sm leading-relaxed",
                "text-foreground placeholder:text-muted-foreground",
                inputDisabled && "opacity-50 cursor-not-allowed"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "max-w-[85%]",
        isAssistant ? "" : "ml-auto"
      )}
    >
      <div
        className={cn(
          "px-5 py-4 rounded-2xl text-sm leading-relaxed",
          isAssistant 
            ? "glass-card-elevated border border-primary/10"
            : "bg-secondary/80 border border-border/20"
        )}
        style={isAssistant ? {
          boxShadow: '0 0 20px hsla(168, 80%, 50%, 0.08)'
        } : undefined}
      >
        <p className="text-foreground whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};
