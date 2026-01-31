import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from './types';

interface QuickAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  belowMessagesContent?: ReactNode;
  helperActions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  quickActions?: QuickAction[];
  placeholder?: string;
  showInput?: boolean;
  inputDisabled?: boolean;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  isTyping = false,
  belowMessagesContent,
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
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsUserScrolledUp(!isAtBottom);
    setShowJumpToLatest(!isAtBottom && messages.length > 2);
  }, [messages.length]);

  // Smooth auto-scroll to bottom (only if user is at bottom)
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (force || !isUserScrolledUp)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
      setIsUserScrolledUp(false);
      setShowJumpToLatest(false);
    }
  }, [isUserScrolledUp]);

  // Auto-scroll when messages change (only if at bottom)
  useEffect(() => {
    if (!isUserScrolledUp) {
      const timeoutId = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isTyping, scrollToBottom, isUserScrolledUp]);

  const handleSend = () => {
    if (inputValue.trim() && !inputDisabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      inputRef.current?.focus();
      // Force scroll to bottom on send
      setTimeout(() => scrollToBottom(true), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
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

      {/* Messages - scrollable area with full history */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-7 py-5 scroll-smooth scrollbar-hide overscroll-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLatest={index === messages.length - 1}
              quickActions={index === messages.length - 1 && message.role === 'assistant' && !isTyping ? quickActions : undefined}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 py-2"
            >
              {/* AI orb dot */}
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, hsl(168, 75%, 55%) 0%, hsl(160, 70%, 40%) 100%)',
                  boxShadow: '0 0 8px hsla(168, 80%, 50%, 0.4)',
                }}
              />
              <div className="flex gap-1.5 px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_infinite]" />
                <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_0.15s_infinite]" />
                <span className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.2s_ease-in-out_0.3s_infinite]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State-specific content (CV upload/review, chip selectors, etc.) */}
        {belowMessagesContent && (
          <div className="pt-2">
            {belowMessagesContent}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Jump to latest pill */}
      <AnimatePresence>
        {showJumpToLatest && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom(true)}
            className="absolute left-1/2 -translate-x-1/2 bottom-24 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-secondary/90 border border-primary/20 text-foreground shadow-lg backdrop-blur-sm hover:bg-secondary transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Jump to latest
          </motion.button>
        )}
      </AnimatePresence>

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
  quickActions?: QuickAction[];
}

const MessageBubble = ({ message, isLatest, quickActions }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';
  const [showChips, setShowChips] = useState(false);

  // Show chips after message renders (300-500ms delay)
  useEffect(() => {
    if (isLatest && isAssistant && quickActions && quickActions.length > 0) {
      const timer = setTimeout(() => setShowChips(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowChips(false);
    }
  }, [isLatest, isAssistant, quickActions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "mb-4",
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
          "flex items-center gap-2 mb-1.5",
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

        {/* Quick actions - attached to this message, appears after delay */}
        <AnimatePresence>
          {showChips && quickActions && quickActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-2.5 mt-3 pl-5"
            >
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.2 }}
                  onClick={action.onClick}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
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
      </div>
    </motion.div>
  );
};
