import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { AISignalOrb } from './AISignalOrb';

const conversationLines = [
  { role: 'ai', text: "What made you choose that approach?" },
  { role: 'human', text: "I wanted to minimize latency for the user..." },
  { role: 'ai', text: "What tradeoffs did you consider?" },
];

export function DecisionsPhase() {
  const shouldReduceMotion = useReducedMotion();
  const phaseRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(phaseRef, { once: true, margin: '-50px' });
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [typedText, setTypedText] = useState('');
  const [orbState, setOrbState] = useState<'idle' | 'thinking' | 'typing'>('idle');

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) {
        setDisplayedLines([0, 1, 2]);
      }
      return;
    }

    let lineIndex = 0;
    
    const typeNextLine = () => {
      if (lineIndex >= conversationLines.length) {
        setOrbState('idle');
        // Reset after delay
        setTimeout(() => {
          setDisplayedLines([]);
          setTypingIndex(-1);
          setTypedText('');
          lineIndex = 0;
          setTimeout(typeNextLine, 1000);
        }, 5000);
        return;
      }

      const line = conversationLines[lineIndex];
      
      // Thinking pause before AI speaks
      if (line.role === 'ai') {
        setOrbState('thinking');
        setTimeout(() => {
          setOrbState('typing');
          setTypingIndex(lineIndex);
          typeCharacters(line.text, lineIndex);
        }, 800);
      } else {
        setTypingIndex(lineIndex);
        typeCharacters(line.text, lineIndex);
      }
    };

    const typeCharacters = (text: string, currentLineIndex: number) => {
      let charIndex = 0;
      setTypedText('');
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setTypedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setDisplayedLines(prev => [...prev, currentLineIndex]);
          setTypingIndex(-1);
          setTypedText('');
          setOrbState('idle');
          lineIndex++;
          setTimeout(typeNextLine, 1200);
        }
      }, 35);
    };

    setTimeout(typeNextLine, 800);
  }, [isInView, shouldReduceMotion]);

  return (
    <div ref={phaseRef} className="mb-20 md:mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Mobile: AI Signals First */}
        <div className="lg:hidden order-1">
          <DecisionsVisual 
            displayedLines={displayedLines}
            typingIndex={typingIndex}
            typedText={typedText}
            orbState={orbState}
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
        </div>

        {/* Left Copy - 5 columns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.1 }}
          className="lg:col-span-5 order-2 lg:order-1"
        >
          <h3 className="text-2xl md:text-[28px] font-bold text-foreground mb-4 font-display">
            Walk through how you think
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-base leading-relaxed">
              HumiQ asks thoughtful, adaptive questions — not to test you, but to understand your judgment.
            </p>
            <p className="text-base leading-relaxed">
              You'll walk through why you made certain choices, what tradeoffs you considered, and how constraints shaped your decisions.
            </p>
          </div>
          {/* Reframing line */}
          <p className="mt-6 text-sm text-foreground/60 italic">
            This isn't an interview. It's a conversation.
          </p>
        </motion.div>

        {/* Spacer - 1 column */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Right AI Signals - 6 columns (Desktop) */}
        <div className="hidden lg:block lg:col-span-6 order-3">
          <DecisionsVisual 
            displayedLines={displayedLines}
            typingIndex={typingIndex}
            typedText={typedText}
            orbState={orbState}
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
        </div>
      </div>
    </div>
  );
}

interface DecisionsVisualProps {
  displayedLines: number[];
  typingIndex: number;
  typedText: string;
  orbState: 'idle' | 'thinking' | 'typing';
  shouldReduceMotion: boolean | null;
  isInView: boolean;
}

function DecisionsVisual({ displayedLines, typingIndex, typedText, orbState, shouldReduceMotion, isInView }: DecisionsVisualProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className="relative"
    >
      {/* Glass Container */}
      <div 
        className="relative p-6 md:p-8 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Ambient gradient behind */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(185, 131, 255, 0.1) 0%, transparent 60%)',
          }}
        />

        <div className="relative">
          {/* AI Orb - Top */}
          <div className="flex items-center gap-3 mb-6">
            <AISignalOrb state={orbState} size={24} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              AI Dialogue
            </span>
          </div>

          {/* Conversation */}
          <div className="space-y-4">
            {conversationLines.map((line, index) => {
              const isDisplayed = displayedLines.includes(index);
              const isTyping = typingIndex === index;
              const showLine = isDisplayed || isTyping;

              if (!showLine && !shouldReduceMotion) return null;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 ${line.role === 'human' ? 'justify-end' : ''}`}
                >
                  {line.role === 'ai' && (
                    <div 
                      className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #5B8CFF, #B983FF)',
                        boxShadow: '0 0 4px rgba(91, 140, 255, 0.5)',
                      }}
                    />
                  )}
                  <div 
                    className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                      line.role === 'ai' 
                        ? 'rounded-tl-sm' 
                        : 'rounded-tr-sm'
                    }`}
                    style={{
                      background: line.role === 'ai' 
                        ? 'rgba(91, 140, 255, 0.08)' 
                        : 'rgba(0, 0, 0, 0.04)',
                      border: `1px solid ${line.role === 'ai' ? 'rgba(91, 140, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)'}`,
                    }}
                  >
                    <p className="text-sm text-foreground/80">
                      {isTyping ? (
                        <>
                          {typedText}
                          <span className="inline-block w-0.5 h-4 ml-0.5 bg-foreground/50 animate-pulse" />
                        </>
                      ) : (
                        line.text
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Not a test. Not a script.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
