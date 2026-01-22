import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData } from '@/hooks/useTalentOnboarding';

interface AIDeepWalkthroughStepProps {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onComplete: () => void;
  saving: boolean;
}

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

const DEEP_QUESTIONS = [
  "Tell me about a tough problem you solved recently — what was the first thing you did?",
  "What tradeoffs did you make, and what did you sacrifice to move forward?",
  "When you're under pressure, how do you decide what matters most?",
  "What kinds of problems get you genuinely excited?",
  "Do you prefer full ownership of something small, or being part of something bigger?",
  "What are you actively trying to get better at right now?",
];

export function AIDeepWalkthroughStep({ 
  data, 
  updateField, 
  onComplete, 
  saving 
}: AIDeepWalkthroughStepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [orbState, setOrbState] = useState<'idle' | 'thinking' | 'typing' | 'complete'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start conversation
  useEffect(() => {
    const intro = `Now let's go a bit deeper. I'll ask you about real decisions and challenges — not to test you, but to understand your judgment. Take your time with each answer.`;
    
    setOrbState('thinking');
    
    setTimeout(() => {
      setOrbState('typing');
      typeMessage(intro, 'intro', () => {
        setTimeout(() => askQuestion(0), 1000);
      });
    }, 800);
  }, []);

  const typeMessage = (text: string, id: string, onComplete?: () => void) => {
    setIsAITyping(true);
    setDisplayedText('');
    
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
        setOrbState('idle');
        onComplete?.();
      }
    }, 25);
  };

  const askQuestion = (index: number) => {
    if (index >= DEEP_QUESTIONS.length) {
      setIsComplete(true);
      setOrbState('complete');
      const completionMsg = "I've learned a lot about how you think. Your Work Identity is taking shape — let's see it.";
      typeMessage(completionMsg, 'complete');
      return;
    }

    setOrbState('thinking');
    
    setTimeout(() => {
      setOrbState('typing');
      typeMessage(DEEP_QUESTIONS[index], `q-${index}`);
      setCurrentQuestion(index);
    }, 700);
  };

  const handleSubmit = () => {
    if (!userInput.trim() || isAITyping) return;

    const answer = userInput.trim();
    const newAnswers = [...allAnswers, answer];
    setAllAnswers(newAnswers);
    
    // Add user message
    setMessages(prev => [...prev, { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      content: answer 
    }]);
    setUserInput('');

    // Store combined answers
    const existingHowIWork = data.howIWork || '';
    const combined = existingHowIWork 
      ? `${existingHowIWork}\n\n---\n\n${DEEP_QUESTIONS[currentQuestion]}\n${answer}`
      : `${DEEP_QUESTIONS[currentQuestion]}\n${answer}`;
    updateField('howIWork', combined);

    // Add a reflection before next question (occasionally)
    if (currentQuestion > 0 && currentQuestion % 2 === 0) {
      setOrbState('thinking');
      setTimeout(() => {
        const reflections = [
          "I notice you think carefully about constraints — that's valuable.",
          "It sounds like you value clarity over speed. Interesting pattern.",
          "You seem to prefer understanding the 'why' before acting.",
        ];
        const reflection = reflections[Math.floor(Math.random() * reflections.length)];
        setOrbState('typing');
        typeMessage(reflection, `reflect-${currentQuestion}`, () => {
          setTimeout(() => askQuestion(currentQuestion + 1), 600);
        });
      }, 500);
    } else {
      setTimeout(() => askQuestion(currentQuestion + 1), 500);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedText]);

  // Orb animation classes
  const getOrbClasses = () => {
    switch (orbState) {
      case 'thinking':
        return 'scale-110 animate-pulse';
      case 'typing':
        return 'scale-105';
      case 'complete':
        return 'scale-100 ring-4 ring-accent/20';
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[650px]">
      {/* Header with AI Orb */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 flex-shrink-0"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* AI Orb with states */}
          <div className={`relative w-10 h-10 transition-all duration-500 ${getOrbClasses()}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] opacity-40 blur-md" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1]" />
          </div>
          <h1 className="text-xl font-display font-semibold text-foreground">
            Cognitive Dialogue
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This isn't an interview. It's a conversation.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground/70">
            Question {Math.min(currentQuestion + 1, DEEP_QUESTIONS.length)} of {DEEP_QUESTIONS.length}
          </span>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="flex items-start gap-3 max-w-[90%]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex-shrink-0 shadow-sm" />
                <div className="bg-white/80 rounded-2xl rounded-tl-md px-4 py-3 text-foreground/90 shadow-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="bg-foreground text-background rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] leading-relaxed">
                {msg.content}
              </div>
            )}
          </motion.div>
        ))}

        {/* AI Typing */}
        <AnimatePresence>
          {isAITyping && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3"
            >
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#5B8CFF] via-[#B983FF] to-[#FF8FB1] flex-shrink-0 shadow-sm transition-transform duration-300 ${orbState === 'thinking' ? 'animate-pulse scale-110' : ''}`} />
              <div className="bg-white/80 rounded-2xl rounded-tl-md px-4 py-3 text-foreground/90 shadow-sm min-w-[60px]">
                {displayedText || (
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
                {displayedText && <span className="text-accent animate-pulse">|</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input or Complete */}
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
              placeholder="Take your time — there's no rush..."
              disabled={isAITyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="min-h-[100px] pr-12 resize-none bg-white/70 border-border/50 focus:border-accent"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!userInput.trim() || isAITyping}
              className="absolute right-3 bottom-3 h-9 w-9 bg-foreground hover:bg-foreground/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-muted-foreground">
              Shift + Enter for new line
            </p>
            <p className="text-xs text-muted-foreground/70">
              Your answers shape your Work Identity
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={onComplete}
            disabled={saving}
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-[#5B8CFF] via-[#8F7CFF] to-[#B983FF] hover:opacity-90 text-white shadow-lg"
          >
            {saving ? (
              'Creating your Work Identity...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                See your Work Identity
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Your profile is yours — even without a job match
          </p>
        </motion.div>
      )}
    </div>
  );
}
