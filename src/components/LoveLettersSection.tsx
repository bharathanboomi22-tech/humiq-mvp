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

interface LoveLettersSectionProps {
  onOpenInput: () => void;
}

function VerticalScrollColumn({ letters, reverse = false }: { letters: LoveLetter[]; reverse?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const columnRef = useRef<HTMLDivElement>(null);
  
  // Double the letters for seamless loop
  const displayLetters = [...letters, ...letters];

  return (
    <div 
      ref={columnRef}
      className="h-[500px] overflow-hidden relative"
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <motion.div
        className="flex flex-col gap-4"
        animate={shouldReduceMotion ? {} : {
          y: reverse ? ['-50%', '0%'] : ['0%', '-50%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {displayLetters.map((letter, index) => (
          <motion.div
            key={`${letter.id}-${index}`}
            className="relative rounded-3xl p-5 bg-[#0B0B10] text-white group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Message */}
            <p className="text-[15px] leading-relaxed text-gray-300 mb-4">
              "{letter.message}"
            </p>
            
            {/* Gradient underline accent */}
            <div 
              className="w-full h-[3px] rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7C3AED 0%, #FF2FB2 50%, #FF6BD6 100%)',
              }}
            />
            
            {/* Footer */}
            {letter.name_or_role && (
              <p className="text-xs text-gray-500 mt-3">
                — {letter.name_or_role}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function LoveLettersSection({ onOpenInput }: LoveLettersSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<LoveLetter[]>([]);

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
      .limit(20);

    if (!error && data) {
      setLetters(data);
    }
  };

  if (letters.length === 0) return null;

  // Split letters into two columns
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  const column1 = shuffled.slice(0, Math.ceil(shuffled.length / 2));
  const column2 = shuffled.slice(Math.ceil(shuffled.length / 2));

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full py-24 md:py-32 overflow-hidden bg-pink-wash"
    >
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Vertical Scrolling Cards */}
          <div className="grid grid-cols-2 gap-4">
            <VerticalScrollColumn letters={column1} />
            <VerticalScrollColumn letters={column2} reverse />
          </div>

          {/* Right - Title Section */}
          <div className="text-center lg:text-left">
            {/* Decorative dots and line */}
            <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
              <div className="flex flex-col gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #FF2FB2)' }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #FF2FB2)' }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #FF2FB2)' }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #FF2FB2)' }}
                />
              </div>
              <div 
                className="w-[3px] h-24 rounded-full"
                style={{ background: 'linear-gradient(180deg, #7C3AED, #FF2FB2)' }}
              />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display mb-4">
              <span className="text-gradient">Love Letters</span>
            </h2>
            
            {/* Subtitle */}
            <p className="text-muted-foreground text-lg">
              Read from my customers
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}