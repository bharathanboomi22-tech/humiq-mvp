import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';

type Act = 1 | 2 | 3;

interface EvidenceCard {
  id: string;
  label: string;
  type: 'github' | 'product' | 'case-study';
  reviewed: boolean;
  weight?: 'heavy' | 'light' | 'faded';
}

const ACT_DURATION = {
  1: 12000,
  2: 12000,
  3: 8000,
};

const ACT_1_COPY = [
  "Identifying real work artifacts…",
  "Discarding resume claims…",
  "Focusing on shipped outcomes…",
];

const ACT_2_COPY = [
  "Evaluating ownership under ambiguity…",
  "Assessing decision quality, not polish…",
  "Noting missing signals explicitly…",
];

const ACT_3_COPY = [
  "Forming a founder-grade recommendation…",
  "Preparing fast validation plan…",
];

const EVIDENCE_CARDS: EvidenceCard[] = [
  { id: '1', label: 'GitHub Repository', type: 'github', reviewed: false },
  { id: '2', label: 'Product / Deployment', type: 'product', reviewed: false },
  { id: '3', label: 'Case Study / Blog', type: 'case-study', reviewed: false },
];



export function LoadingExperience() {
  const [currentAct, setCurrentAct] = useState<Act>(1);
  const [copyIndex, setCopyIndex] = useState(0);
  const [cards, setCards] = useState<EvidenceCard[]>([]);
  const [showMissingSignal, setShowMissingSignal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentAct(2), ACT_DURATION[1]);
    const timer2 = setTimeout(() => setCurrentAct(3), ACT_DURATION[1] + ACT_DURATION[2]);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const getCopy = () => {
      if (currentAct === 1) return ACT_1_COPY;
      if (currentAct === 2) return ACT_2_COPY;
      return ACT_3_COPY;
    };
    setCopyIndex(0);
    const interval = setInterval(() => {
      setCopyIndex(prev => (prev + 1) % getCopy().length);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentAct]);

  useEffect(() => {
    if (currentAct !== 1) return;
    
    const revealCard = (index: number) => {
      setCards(prev => {
        const updated = [...prev];
        if (index < EVIDENCE_CARDS.length) {
          updated.push({ ...EVIDENCE_CARDS[index], reviewed: false });
        }
        return updated;
      });
      
      setTimeout(() => {
        setCards(prev => 
          prev.map((card, i) => 
            i === index ? { ...card, reviewed: true } : card
          )
        );
      }, 1500);
    };

    const timers: NodeJS.Timeout[] = [];
    EVIDENCE_CARDS.forEach((_, index) => {
      timers.push(setTimeout(() => revealCard(index), index * 3000));
    });

    return () => timers.forEach(clearTimeout);
  }, [currentAct]);

  useEffect(() => {
    if (currentAct !== 2) return;

    const timer1 = setTimeout(() => {
      setCards(prev => prev.map((card, i) => ({
        ...card,
        weight: i === 0 ? 'heavy' : i === 1 ? 'light' : 'faded'
      })));
    }, 2000);

    const timer2 = setTimeout(() => setShowMissingSignal(true), 5000);
    const timer3 = setTimeout(() => setShowMissingSignal(false), 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentAct]);

  const getCurrentCopy = () => {
    if (currentAct === 1) return ACT_1_COPY[copyIndex];
    if (currentAct === 2) return ACT_2_COPY[copyIndex];
    return ACT_3_COPY[copyIndex];
  };

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="max-w-sm w-full space-y-4">
          {['Evidence collected', 'Ownership signals reviewed', 'Judgment formed', 'Recommendation prepared'].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-foreground/90">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-full max-w-md">
        {/* Act indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2, 3].map((act) => (
            <motion.div
              key={act}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: currentAct === act ? 1.2 : 1,
                opacity: currentAct >= act ? 1 : 0.3,
                backgroundColor: currentAct >= act ? 'hsl(252 100% 68%)' : 'rgba(255,255,255,0.08)'
              }}
              transition={{ duration: 0.22, ease: easing }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>

        {/* Main visual area */}
        <div className="relative h-72 mb-10">
          <AnimatePresence mode="wait">
            {/* ACT 1: Evidence Collection */}
            {currentAct === 1 && (
              <motion.div
                key="act1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: easing }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="w-full max-w-xs"
                  >
                    <div className="flex items-center justify-between px-5 py-4 rounded-lg glass-card">
                      <span className="text-sm text-foreground/85">{card.label}</span>
                      <AnimatePresence>
                        {card.reviewed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: easing }}
                            className="flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-accent" />
                            <span className="text-xs text-accent font-medium">Reviewed</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ACT 2: Judgment Under Ambiguity */}
            {currentAct === 2 && (
              <motion.div
                key="act2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: easing }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="relative w-full max-w-xs">
                  {/* Scale bar */}
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: cards[0]?.weight === 'heavy' ? 4 : 0 }}
                    transition={{ duration: 1.5, ease: easing }}
                    className="relative h-0.5 bg-border rounded-full mb-8"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent accent-glow" />
                  </motion.div>

                  {/* Weighted cards */}
                  <div className="space-y-3">
                    {cards.map((card) => (
                      <motion.div
                        key={card.id}
                        animate={{
                          opacity: card.weight === 'faded' ? 0.4 : 1,
                          scale: card.weight === 'heavy' ? 1.02 : card.weight === 'faded' ? 0.98 : 1,
                          x: card.weight === 'heavy' ? 6 : card.weight === 'light' ? -6 : 0,
                        }}
                        transition={{ duration: 0.8, ease: easing }}
                        className={`flex items-center justify-between px-5 py-4 rounded-lg glass-card ${
                          card.weight === 'heavy' ? 'border-accent/30' : ''
                        }`}
                      >
                        <span className={`text-sm ${card.weight === 'faded' ? 'text-muted-foreground' : 'text-foreground/85'}`}>
                          {card.label}
                        </span>
                        <Check className={`w-4 h-4 ${card.weight === 'faded' ? 'text-muted-foreground/50' : 'text-accent'}`} />
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showMissingSignal && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: easing }}
                        className="mt-6 flex items-center justify-center gap-2 text-muted-foreground"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-xs">Noting unknown signals</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ACT 3: Decision Formation */}
            {currentAct === 3 && (
              <motion.div
                key="act3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: easing }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: easing }}
                  className="text-center"
                >
                  <div className="inline-block px-8 py-5 rounded-xl glass-card border-accent/30 accent-glow">
                    <span className="text-xl font-medium text-foreground font-display">
                      Recommendation Ready
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: easing }}
                  className="mt-8 flex items-center gap-3"
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.2 + i * 0.15, ease: easing }}
                      className="w-20 h-2 rounded-full bg-border"
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Microcopy */}
        <div className="text-center min-h-[48px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${currentAct}-${copyIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easing }}
              className="text-sm text-muted-foreground"
            >
              {getCurrentCopy()}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          30–60 seconds
        </p>
      </div>
    </div>
  );
}
