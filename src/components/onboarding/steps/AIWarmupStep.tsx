import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '@/hooks/useTalentOnboarding';

interface AIWarmupStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onNext: () => void;
  saving: boolean;
}

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  isTyping?: boolean;
}

const WARMUP_QUESTIONS = [
  "What kind of work have you enjoyed most recently?",
  "When you're stuck on a problem, what's your first instinct — explore on your own, ask someone, or rebuild from scratch?",
  "Do you prefer deep solo focus or fast team momentum?",
];

export function AIWarmupStep({ data, updateField, onNext, saving }: AIWarmupStepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial AI greeting with typing effect
  useEffect(() => {
    const greeting = `Hi ${data.fullName?.split(' ')[0] || 'there'}! I'm here to learn how you think and work. Let's start with a few quick questions — no pressure, just conversation.`;
    
    setIsAITyping(true);
    setMessages([{ id: '0', role: 'ai', content: '', isTyping: true }]);

    // Simulate thinking pause
    const thinkDelay = setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < greeting.length) {
          setDisplayedText(greeting.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setMessages([{ id: '0', role: 'ai', content: greeting }]);
          setIsAITyping(false);
          
          // Add first question after a pause
          setTimeout(() => askQuestion(0), 800);
        }
      }, 25);

      return () => clearInterval(typeInterval);
    }, 700);

    return () => clearTimeout(thinkDelay);
  }, [data.fullName]);

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= WARMUP_QUESTIONS.length) {
      setIsComplete(true);
      // Add completion message
      const completionMsg = "Great — I'm starting to understand how you work. Let's look at some real examples next.";
      typeAIMessage(completionMsg, `complete-${Date.now()}`);
      return;
    }

    const question = WARMUP_QUESTIONS[questionIndex];
    typeAIMessage(question, `q-${questionIndex}`);
    setCurrentQuestion(questionIndex);
  };

  const typeAIMessage = (text: string, id: string) => {
    setIsAITyping(true);
    setDisplayedText('');
    
    // Thinking pause
    setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setMessages(prev => [...prev, { id, role: 'ai', content: text }]);
          setIsAITyping(false);
          setDisplayedText('');
        }
      }, 30);
    }, 600);
  };

  const handleSubmit = () => {
    if (!userInput.trim() || isAITyping) return;

    const newAnswer = userInput.trim();
    setAnswers(prev => [...prev, newAnswer]);
    
    // Add user message
    setMessages(prev => [...prev, { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      content: newAnswer 
    }]);
    setUserInput('');

    // Store in data
    const allAnswers = [...answers, newAnswer].join('\n\n');
    updateField('howIWork', allAnswers);

    // Ask next question
    setTimeout(() => askQuestion(currentQuestion + 1), 400);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedText]);

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 flex-shrink-0"
      >
        <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
          Let's warm up
        </h1>
        <p className="text-sm text-muted-foreground">
          Building trust before proof
        </p>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="flex items-start gap-3 max-w-[85%]">
                {/* AI Orb */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex-shrink-0 shadow-sm" />
                <div className="bg-white/80 rounded-2xl rounded-tl-md px-4 py-3 text-foreground/90 shadow-sm">
                  {msg.content}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="bg-foreground text-background rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
                {msg.content}
              </div>
            )}
          </motion.div>
        ))}

        {/* AI Typing Indicator */}
        <AnimatePresence>
          {isAITyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex-shrink-0 shadow-sm animate-pulse" />
              <div className="bg-white/80 rounded-2xl rounded-tl-md px-4 py-3 text-foreground/90 shadow-sm min-w-[60px]">
                {displayedText || (
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
                {displayedText && <span className="animate-pulse">|</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              disabled={isAITyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="min-h-[80px] pr-12 resize-none bg-white/70 border-border/50 focus:border-accent"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!userInput.trim() || isAITyping}
              className="absolute right-2 bottom-2 h-8 w-8 bg-foreground hover:bg-foreground/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={onNext}
            disabled={saving}
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white"
          >
            {saving ? 'Saving...' : 'Show a signal'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
