import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoveLetterModal } from '@/components/LoveLetterModal';
import { Button } from '@/components/ui/button';

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

export default function LoveLetter() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLetters();

    const channel = supabase
      .channel('love-letters-page')
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

  // Limit to 2 rows of cards (8 cards max for nice 4x2 grid)
  const displayLetters = letters.slice(0, 8);

  return (
    <div className="min-h-screen blush-gradient">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.4)' }}
      >
        <div className="container max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="font-display text-xl font-bold tracking-tight text-foreground"
            >
              HumIQ
            </button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="relative px-5 py-2 rounded-full text-sm font-medium text-white overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF 0%, #8F7CFF 35%, #B983FF 65%, #FF8FB1 100%)',
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Send Love
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-6 py-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div 
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF, #B983FF, #FF8FB1)',
                boxShadow: '0 0 10px rgba(91, 140, 255, 0.5)',
              }}
            />
            <span className="text-sm uppercase tracking-[0.12em] text-muted-foreground font-medium">
              HumIQ Love Letters
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Human reflections after meeting intelligence
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thoughts, feelings, and moments shared by people who experienced HumIQ.
          </p>
        </motion.div>

        {/* Cards Grid - 2 Rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {displayLetters.map((letter, index) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative p-[1px] rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #5B8CFF, #8F7CFF, #B983FF, #FF8FB1)',
              }}
            >
              <div 
                className="relative h-full p-5 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Content */}
                <div className="flex items-start gap-2.5 mb-3">
                  <div 
                    className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #5B8CFF, #B983FF)',
                      boxShadow: '0 0 6px rgba(91, 140, 255, 0.5)',
                    }}
                  />
                  <p className="text-sm leading-relaxed text-foreground/85 line-clamp-4">
                    "{letter.message}"
                  </p>
                </div>

                {/* Footer */}
                {(letter.name_or_role || letter.user_type) && (
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/5">
                    {letter.name_or_role && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {letter.name_or_role}
                      </span>
                    )}
                    {letter.user_type && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(91, 140, 255, 0.08)' }}
                      >
                        {userTypeEmoji[letter.user_type] || '💬'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {letters.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No love letters yet. Be the first!</p>
          </div>
        )}
      </main>

      <LoveLetterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLetters}
      />
    </div>
  );
}
