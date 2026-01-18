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
  1: 12000, // 12s for evidence collection
  2: 12000, // 12s for judgment
  3: 8000,  // 8s for decision formation
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

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Act progression
  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentAct(2), ACT_DURATION[1]);
    const timer2 = setTimeout(() => setCurrentAct(3), ACT_DURATION[1] + ACT_DURATION[2]);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Copy rotation
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

  // Act 1: Reveal cards one by one with "Reviewed" checkmarks
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
      
      // Mark as reviewed after delay
      setTimeout(() => {
        setCards(prev => 
          prev.map((card, i) => 
            i === index ? { ...card, reviewed: true } : card
          )
        );
      }, 1200);
    };

    const timers: NodeJS.Timeout[] = [];
    EVIDENCE_CARDS.forEach((_, index) => {
      timers.push(setTimeout(() => revealCard(index), index * 2800));
    });

    return () => timers.forEach(clearTimeout);
  }, [currentAct]);

  // Act 2: Add weights and show missing signal
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

  // Fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="max-w-sm w-full space-y-4">
          <div className="flex items-center gap-3 text-foreground/90">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">Evidence collected</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/90">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">Ownership signals reviewed</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/90">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">Judgment formed</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/90">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">Recommendation prepared</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-full max-w-md">
        {/* Act indicator - subtle dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((act) => (
            <div
              key={act}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                currentAct >= act ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Main visual area */}
        <div className="relative h-64 mb-10">
          <AnimatePresence mode="wait">
            {/* ACT 1: Evidence Collection */}
            {currentAct === 1 && (
              <motion.div
                key="act1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full max-w-xs"
                  >
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border/60">
                      <span className="text-sm text-foreground/80">{card.label}</span>
                      <AnimatePresence>
                        {card.reviewed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs text-accent">Reviewed</span>
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
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Balance scale visualization */}
                <div className="relative w-full max-w-xs">
                  {/* Scale bar */}
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: cards[0]?.weight === 'heavy' ? 3 : 0 }}
                    transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative h-1 bg-border/60 rounded-full mb-8"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                  </motion.div>

                  {/* Weighted cards */}
                  <div className="space-y-2">
                    {cards.map((card) => (
                      <motion.div
                        key={card.id}
                        animate={{
                          opacity: card.weight === 'faded' ? 0.4 : 1,
                          scale: card.weight === 'heavy' ? 1.02 : card.weight === 'faded' ? 0.98 : 1,
                          x: card.weight === 'heavy' ? 4 : card.weight === 'light' ? -4 : 0,
                        }}
                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors duration-500 ${
                          card.weight === 'faded' 
                            ? 'bg-card/50 border-border/30' 
                            : 'bg-card border-border/60'
                        }`}
                      >
                        <span className={`text-sm ${card.weight === 'faded' ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                          {card.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 ${card.weight === 'faded' ? 'text-muted-foreground/50' : 'text-accent'}`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Missing signal indicator */}
                  <AnimatePresence>
                    {showMissingSignal && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 flex items-center justify-center gap-2 text-muted-foreground"
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
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Decision card emerging */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center"
                >
                  <div className="inline-block px-6 py-4 rounded-xl bg-card border border-accent/30 shadow-sm">
                    <span className="text-lg font-medium text-foreground">
                      Recommendation Ready
                    </span>
                  </div>
                </motion.div>

                {/* Supporting evidence settling */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="mt-6 flex items-center gap-2"
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.2 + i * 0.15 }}
                      className="w-16 h-2 rounded-full bg-border/60"
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Microcopy - calm, rotating */}
        <div className="text-center min-h-[48px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${currentAct}-${copyIndex}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-sm text-muted-foreground"
            >
              {getCurrentCopy()}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Time estimate */}
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          30–60 seconds
        </p>
      </div>
    </div>
  );
}
