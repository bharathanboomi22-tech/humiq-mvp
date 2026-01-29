import { useState, useEffect } from 'react';
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

// Sample testimonials for display
const sampleTestimonials = [
  {
    id: '1',
    message: "I tried this on my github and it was damn good! Really impressive. I'm impressed I hope you succeed.",
  },
  {
    id: '2', 
    message: "I tried this on my github and it was damn good! Really impressive. I'm impressed I hope you succeed.",
  },
];

function TestimonialCard({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] p-6 bg-[#0B0B10] text-white w-full max-w-[380px]">
      <p className="text-[15px] leading-relaxed text-gray-300 mb-4">
        "{message}"
      </p>
      
      {/* Gradient underline */}
      <div 
        className="w-full h-[3px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, #7C3AED 0%, #FF2FB2 50%, #FF6BD6 100%)',
        }}
      />
    </div>
  );
}

export function LoveLettersSection({ onOpenInput }: LoveLettersSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<LoveLetter[]>([]);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data && data.length > 0) {
      setLetters(data);
    }
  };

  const displayTestimonials = letters.length > 0 
    ? letters.slice(0, 2).map(l => ({ id: l.id, message: l.message }))
    : sampleTestimonials;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full py-24 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD6EB 60%, #FF6BD6 100%)',
      }}
    >
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Testimonial Cards (Vertical Stack) */}
          <div className="flex flex-col gap-6 items-start">
            {displayTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <TestimonialCard message={testimonial.message} />
              </motion.div>
            ))}
          </div>

          {/* Right - Title Section */}
          <motion.div 
            className="text-center lg:text-left flex flex-col items-center lg:items-start"
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Decorative dots and line */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex flex-col gap-2.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#9333EA' }}
                />
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#9333EA' }}
                />
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#9333EA' }}
                />
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#9333EA' }}
                />
              </div>
              <div 
                className="w-[3px] h-28 rounded-full"
                style={{ background: '#9333EA' }}
              />
            </div>

            {/* Title */}
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display mb-4 tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #7C3AED, #FF2FB2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Love Letters
            </h2>
            
            {/* Subtitle */}
            <p className="text-[#111111]/70 text-lg">
              Read from my customers
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
