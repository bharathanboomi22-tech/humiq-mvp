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
    const speed = 0.5;

    const animate = () => {
      if (!isPaused && scroll) {
        scrollPos += speed;
        
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Ambient Intelligence Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large blue radial glow - top right */}
        <div 
          className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, #5B8CFF 0%, transparent 70%)',
          }}
        />
        {/* Lavender glow - center left */}
        <div 
          className="absolute top-1/2 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.06] -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, #B983FF 0%, transparent 70%)',
          }}
        />
        {/* Subtle pink accent - bottom */}
        <div 
          className="absolute -bottom-24 right-1/3 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #FF8FB1 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Section Title */}
      <div className="relative text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2"
        >
          {/* Small AI orb indicator */}
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #5B8CFF, #B983FF, #FF8FB1)',
              boxShadow: '0 0 12px rgba(91, 140, 255, 0.5)',
            }}
          />
          <h3 className="text-sm uppercase tracking-[0.12em] text-muted-foreground font-medium">
            HumIQ Love Letters
          </h3>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-3 text-foreground/60 text-sm max-w-md mx-auto"
        >
          Human reflections left behind after meeting intelligence
        </motion.p>
      </div>

      {/* Scrolling Cards Container */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-x-hidden"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex gap-5 px-8 w-max">
          {displayLetters.map((letter, index) => (
            <motion.div
              key={`${letter.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.5 }}
              whileHover={{ 
                y: -4, 
                transition: { duration: 0.2 } 
              }}
              className="group relative flex-shrink-0 w-[320px] p-6 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Subtle gradient accent on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.05) 0%, rgba(185, 131, 255, 0.05) 50%, rgba(255, 143, 177, 0.03) 100%)',
                }}
              />
              
              {/* Top gradient line accent */}
              <div 
                className="absolute top-0 left-6 right-6 h-px opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, #5B8CFF, #B983FF, transparent)',
                }}
              />

              {/* Content */}
              <div className="relative">
                {/* AI Signal Orb */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #5B8CFF, #B983FF)',
                      boxShadow: '0 0 8px rgba(91, 140, 255, 0.4)',
                    }}
                  />
                  <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">
                    "{letter.message}"
                  </p>
                </div>

                {/* Footer */}
                {(letter.name_or_role || letter.user_type) && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/5">
                    {letter.name_or_role && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {letter.name_or_role}
                      </span>
                    )}
                    {letter.user_type && (
                      <span 
                        className="text-sm px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(91, 140, 255, 0.08)',
                        }}
                        title={letter.user_type}
                      >
                        {userTypeEmoji[letter.user_type] || '💬'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
