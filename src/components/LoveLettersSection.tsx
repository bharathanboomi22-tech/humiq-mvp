import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

// Row configuration for parallax effect - 2 rows only
const rowConfigs = [
  { speed: 0.4, direction: 1 },   // Row 1: slow, left-to-right
  { speed: 0.6, direction: -1 },  // Row 2: medium, right-to-left
];

interface ScrollingRowProps {
  letters: LoveLetter[];
  speed: number;
  direction: number;
  isPaused: boolean;
  rowIndex: number;
}

function ScrollingRow({ letters, speed, direction, isPaused, rowIndex }: ScrollingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const scrollPosRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || letters.length === 0) return;

    const scroll = scrollRef.current;
    if (!scroll) return;

    // Set initial position for reverse direction
    if (direction === -1) {
      scrollPosRef.current = scroll.scrollWidth / 2;
    }

    const animate = () => {
      if (!isPaused && scroll) {
        scrollPosRef.current += speed * direction;
        
        const halfWidth = scroll.scrollWidth / 2;
        if (direction === 1 && scrollPosRef.current >= halfWidth) {
          scrollPosRef.current = 0;
        } else if (direction === -1 && scrollPosRef.current <= 0) {
          scrollPosRef.current = halfWidth;
        }
        
        scroll.scrollLeft = scrollPosRef.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, letters.length, shouldReduceMotion, speed, direction]);

  // Duplicate letters for infinite scroll effect
  const displayLetters = [...letters, ...letters];

  return (
    <div
      ref={scrollRef}
      className="overflow-x-hidden"
      style={{ 
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
      }}
    >
      <div className="flex gap-5 px-4 w-max">
        {displayLetters.map((letter, index) => (
          <motion.div
            key={`${letter.id}-${rowIndex}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.4 }}
            whileHover={{ 
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 } 
            }}
            className="group relative flex-shrink-0 w-[320px] sm:w-[360px] p-[1.5px] rounded-xl overflow-hidden cursor-default"
            style={{
              background: 'linear-gradient(135deg, #8ff2ff 0%, #92f6f0 50%, #67edfa 100%)',
            }}
          >
            {/* Inner card content - white with subtle gradient wash */}
            <div
              className="relative h-full p-5 rounded-[10px]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 70%, rgba(143,242,255,0.08) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Hover intelligence glow overlay */}
              <div 
                className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(143, 242, 255, 0.12) 0%, rgba(146, 246, 240, 0.08) 50%, rgba(103, 237, 250, 0.06) 100%)',
                }}
              />

              {/* Content */}
              <div className="relative">
                {/* AI Signal Orb + Message */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div 
                    className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #8ff2ff, #67edfa)',
                      boxShadow: '0 0 6px rgba(143, 242, 255, 0.6)',
                    }}
                  />
                  <p className="text-sm leading-relaxed text-foreground/85">
                    "{letter.message}"
                  </p>
                </div>

                {/* Footer */}
                {(letter.name_or_role || letter.user_type) && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-foreground/5">
                    {letter.name_or_role && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {letter.name_or_role}
                      </span>
                    )}
                    {letter.user_type && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(143, 242, 255, 0.15)',
                        }}
                        title={letter.user_type}
                      >
                        {userTypeEmoji[letter.user_type] || '💬'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function LoveLettersSection({ onOpenInput }: LoveLettersSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isPaused, setIsPaused] = useState(false);

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
    };
  }, []);

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40); // Enough for 2 rows

    if (!error && data) {
      setLetters(data);
    }
  };

  if (letters.length === 0) return null;

  // Split letters into 2 rows - ensuring NO duplicates across rows
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  const rowSize = Math.ceil(shuffled.length / 2);
  const rows = [
    shuffled.slice(0, rowSize),
    shuffled.slice(rowSize),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full py-20 md:py-28 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Cognitive Field Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cognitive teal glow - top right */}
        <div 
          className="absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, rgba(143, 242, 255, 0.8) 0%, transparent 65%)',
          }}
        />
        {/* Aqua glow - center left */}
        <div 
          className="absolute top-1/2 -left-60 w-[700px] h-[700px] rounded-full opacity-[0.08] -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(146, 246, 240, 0.8) 0%, transparent 65%)',
          }}
        />
        {/* Subtle cyan accent - bottom center */}
        <div 
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, rgba(103, 237, 250, 0.8) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Section Title */}
      <div className="relative text-center mb-10 md:mb-14 px-6">
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
              background: 'linear-gradient(135deg, #8ff2ff, #92f6f0, #67edfa)',
              boxShadow: '0 0 10px rgba(143, 242, 255, 0.6)',
            }}
          />
          <h3 className="text-sm uppercase tracking-[0.12em] text-muted-foreground font-medium">
            HumiQ Love Letters
          </h3>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-3 text-foreground/55 text-sm max-w-md mx-auto"
        >
          Human reflections left behind after meeting intelligence
        </motion.p>
      </div>

      {/* 2 Scrolling Rows with Parallax Effect */}
      <div className="space-y-5 md:space-y-6">
        {rows.map((rowLetters, rowIndex) => (
          <ScrollingRow
            key={rowIndex}
            letters={rowLetters}
            speed={rowConfigs[rowIndex]?.speed ?? 0.5}
            direction={rowConfigs[rowIndex]?.direction ?? 1}
            isPaused={isPaused}
            rowIndex={rowIndex}
          />
        ))}
      </div>
    </motion.section>
  );
}
