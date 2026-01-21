import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface LoveLetter {
  id: string;
  message: string;
  name_or_role: string | null;
  user_type: string | null;
  created_at: string;
}

const userTypeEmoji: Record<string, string> = {
  'Founder': '🌱',
  'Recruiter': '🔍',
  'Hiring Manager': '🧭',
  'Talent': '✨',
  'Other': '💬',
};

interface LoveLettersSectionProps {
  onOpenInput: () => void;
}

export function LoveLettersSection({ onOpenInput }: LoveLettersSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Fetch letters on mount
  useEffect(() => {
    fetchLetters();

    const channel = supabase
      .channel('love-letters-section')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'love_letters',
        },
        (payload) => {
          const newLetter = payload.new as LoveLetter;
          setLetters((prev) => {
            if (prev.some((l) => l.id === newLetter.id)) return prev;
            return [newLetter, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setLetters(data);
    }
  };

  // Auto-scroll animation
  useEffect(() => {
    if (shouldReduceMotion || letters.length === 0) return;

    const scroll = scrollRef.current;
    if (!scroll) return;

    let scrollPos = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused && scroll) {
        scrollPos += speed;
        
        // Reset scroll when we've scrolled through half (for infinite loop effect)
        const halfWidth = scroll.scrollWidth / 2;
        if (scrollPos >= halfWidth) {
          scrollPos = 0;
        }
        
        scroll.scrollLeft = scrollPos;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, letters.length, shouldReduceMotion]);

  if (letters.length === 0) return null;

  // Duplicate letters for infinite scroll effect
  const displayLetters = [...letters, ...letters];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full py-24 bg-background"
    >
      {/* Section Title */}
      <div className="text-center mb-8">
        <h3 className="text-sm uppercase tracking-[0.08em] text-muted-foreground font-medium">
          HumIQ Love Letters
        </h3>
      </div>

      {/* Scrolling Cards Container */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-x-hidden"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        }}
      >
        <div className="flex gap-4 px-8 w-max">
          {displayLetters.map((letter, index) => (
            <motion.div
              key={`${letter.id}-${index}`}
              className="flex-shrink-0 w-[300px] p-5 rounded-2xl glass-card"
            >
              {/* Quote Message */}
              <p className="text-sm leading-relaxed line-clamp-3 text-foreground">
                "{letter.message}"
              </p>

              {/* Footer */}
              {(letter.name_or_role || letter.user_type) && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/5">
                  {letter.name_or_role && (
                    <span className="text-xs text-muted-foreground">
                      {letter.name_or_role}
                    </span>
                  )}
                  {letter.user_type && (
                    <span className="text-sm" title={letter.user_type}>
                      {userTypeEmoji[letter.user_type] || '💬'}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}