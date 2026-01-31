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
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      // Max height of ~160px (about 6 lines)
      inputRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Smooth auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: hasScrolledOnce ? 'smooth' : 'auto',
        block: 'end'
      });
      setHasScrolledOnce(true);
    }
  }, [hasScrolledOnce]);

  // Auto-scroll when messages change or typing indicator appears
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 50);
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

  // Get only the most recent messages for minimal view (last 3)
  const visibleMessages = messages.slice(-3);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex-shrink-0 px-7 pt-7 pb-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          {/* AI Orb indicator */}
          <div className="relative w-10 h-10">
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, hsla(168, 80%, 50%, 0.4) 0%, hsla(145, 70%, 45%, 0.2) 50%, transparent 70%)',
                filter: 'blur(6px)',
              }}
            />
            <div 
              className="absolute inset-1 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, hsl(168, 75%, 55%) 0%, hsl(160, 70%, 40%) 50%, hsl(150, 60%, 30%) 100%)',
                boxShadow: '0 2px 12px hsla(168, 80%, 45%, 0.4), inset 0 1px 3px hsla(0, 0%, 100%, 0.2)',
              }}
            />
            <div 
              className="absolute top-1.5 left-2 w-2 h-2 rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, hsla(0, 0%, 100%, 0.9) 0%, transparent 70%)',
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              HumiQ
            </h1>
            <p className="text-xs text-muted-foreground">
              Super Career Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Messages - scrollable area with stable layout */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-7 py-5 scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleMessages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLatest={index === visibleMessages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator - fixed height to prevent layout shift */}
        <div className="min-h-[44px]">
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex gap-1.5 px-4 py-2.5 rounded-xl bg-secondary/30">
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_0.15s_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_0.3s_infinite]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick action buttons */}
        <AnimatePresence>
          {quickActions && quickActions.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-3 pt-4"
            >
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={action.onClick}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    action.variant === 'primary' 
                      ? "btn-primary"
                      : "btn-secondary"
                  )}
                >
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Fixed Input Area at Bottom */}
      {showInput && (
        <div className="flex-shrink-0 p-5 pt-3 border-t border-border/10">
          {/* Helper actions */}
          {helperActions && helperActions.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {helperActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar - glass surface */}
          <div 
            className="relative rounded-2xl transition-all duration-200"
            style={{
              background: 'hsla(160, 25%, 8%, 0.8)',
              border: '1px solid hsla(168, 40%, 35%, 0.12)',
              boxShadow: '0 2px 12px hsla(0, 0%, 0%, 0.2)',
            }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={inputDisabled}
              rows={1}
              className={cn(
                "w-full bg-transparent px-4 py-3.5 pr-24 resize-none",
                "text-sm leading-relaxed min-h-[48px] max-h-[160px]",
                "text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-0",
                "scrollbar-hide",
                inputDisabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ 
                overflow: inputValue.length > 100 ? 'auto' : 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
              <button
                className="p-2.5 rounded-lg text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/40 transition-all duration-150"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || inputDisabled}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-150",
                  inputValue.trim() && !inputDisabled
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground/40"
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      layout="position"
      className={cn(
        "mb-5",
        isAssistant ? "" : "flex justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[90%] text-sm leading-relaxed",
          isAssistant ? "text-foreground" : "text-foreground/90"
        )}
      >
        {/* Role indicator with orb for AI */}
        <div className={cn(
          "flex items-center gap-2 mb-2",
          isAssistant ? "" : "justify-end"
        )}>
          {isAssistant && (
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                background: 'radial-gradient(circle at 30% 30%, hsl(168, 75%, 55%) 0%, hsl(160, 70%, 40%) 100%)',
                boxShadow: '0 0 8px hsla(168, 80%, 50%, 0.4)',
              }}
            />
          )}
          <span className={cn(
            "text-xs font-medium",
            isAssistant ? "text-primary/80" : "text-muted-foreground/70"
          )}>
            {isAssistant ? 'HumiQ' : 'You'}
          </span>
        </div>
        
        {/* Message content */}
        <p className="whitespace-pre-wrap pl-5">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};
