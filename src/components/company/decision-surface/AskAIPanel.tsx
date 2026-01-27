import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SUGGESTED_QUESTIONS = [
  'Why is this person strong under ambiguity?',
  'What kind of team would they struggle in?',
  'How risky is this hire for our current stage?',
  'Compare their decision-making style to our team.',
];

interface AskAIPanelProps {
  talentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AskAIPanel = ({ talentName, isOpen, onClose }: AskAIPanelProps) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (q: string) => {
    setQuestion(q);
    setIsLoading(true);
    // Simulated response for now
    setTimeout(() => {
      setResponse(
        `Based on their interview and work signals, ${talentName} demonstrates strong pattern recognition when facing ambiguous problems. They tend to reframe the problem space before committing to a solution path, which suggests they would thrive in environments where clarity is earned, not given.`
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 w-96 glass-card border shadow-xl z-50"
        >
          <header className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B8CFF]" />
              <span className="font-medium text-sm">Ask AI about {talentName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </header>

          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {!response && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Suggested questions</p>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    className="w-full text-left p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm text-foreground/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Thinking...
              </div>
            )}

            {response && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{question}</p>
                <p className="text-sm text-foreground/85 leading-relaxed">{response}</p>
              </div>
            )}
          </div>

          <footer className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && question && handleAsk(question)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => question && handleAsk(question)}
                disabled={!question || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
