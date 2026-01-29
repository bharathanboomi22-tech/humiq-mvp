import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
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
    message: "Finally, someone understands that resumes don't tell the real story. This is the future of hiring.",
  },
  {
    id: '3',
    message: "The AI conversation felt so natural. It actually understood what I was trying to say about my work.",
  },
  {
    id: '4',
    message: "As a hiring manager, I've been waiting for something like this. Evidence > claims.",
  },
  {
    id: '5',
    message: "Loved how it focused on my thinking process rather than just listing my skills.",
  },
  {
    id: '6',
    message: "This is what the hiring industry needs. Finally moving beyond keyword matching.",
  },
];

function TestimonialCard({ message, name }: { message: string; name?: string }) {
  return (
    <motion.div 
      className="rounded-[28px] p-6 bg-[#0B0B10] text-white w-full max-w-[380px] flex-shrink-0"
      whileHover={{ 
        y: -4,
        transition: { duration: 0.3 },
      }}
    >
      <p className="text-[15px] leading-relaxed text-gray-300 mb-4">
        "{message}"
      </p>
      
      {name && (
        <p className="text-xs text-gray-500 mb-3">— {name}</p>
      )}
      
      {/* Gradient underline */}
      <motion.div 
        className="w-full h-[3px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, #7C3AED 0%, #FF2FB2 50%, #FF6BD6 100%)',
        }}
        whileHover={{
          boxShadow: '0 0 12px rgba(255, 47, 178, 0.5)',
        }}
      />
    </motion.div>
  );
}

// Infinite scroll marquee component
function InfiniteMarquee({ items, isPaused }: { items: typeof sampleTestimonials; isPaused: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  
  // Double the items for seamless loop
  const duplicatedItems = [...items, ...items];
  
  return (
    <motion.div
      className="flex flex-col gap-4"
      animate={shouldReduceMotion || isPaused ? {} : {
        y: [0, -50 * items.length],
      }}
      transition={{
        duration: items.length * 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {duplicatedItems.map((item, index) => (
        <TestimonialCard 
          key={`${item.id}-${index}`} 
          message={item.message} 
        />
      ))}
    </motion.div>
  );
}

// Send Love Modal
function SendLoveModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('love_letters')
      .insert({
        message: message.trim(),
        name_or_role: name.trim() || role.trim() || null,
        user_type: role.trim() || null,
      });

    if (!error) {
      setMessage('');
      setName('');
      setRole('');
      setCompany('');
      onSuccess();
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <h3 className="text-xl font-bold text-[#111111] mb-2 font-display">
                Send a Love Letter 💌
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Share your thoughts about HumiQ
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you love about HumiQ? *"
                    required
                    className="w-full h-28 px-4 py-3 text-sm rounded-xl resize-none
                      bg-gray-50 text-[#111111] placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-pink-hot/30
                      transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (optional)"
                    className="px-4 py-3 text-sm rounded-xl
                      bg-gray-50 text-[#111111] placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-pink-hot/30"
                  />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Role (optional)"
                    className="px-4 py-3 text-sm rounded-xl
                      bg-gray-50 text-[#111111] placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-pink-hot/30"
                  />
                </div>

                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company (optional)"
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-gray-50 text-[#111111] placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-pink-hot/30"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(255, 47, 178, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Sending...' : 'Send Love 💛'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function LoveLettersSection({ onOpenInput }: LoveLettersSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      setLetters(data);
    }
  };

  const displayTestimonials = letters.length > 0 
    ? letters.map(l => ({ id: l.id, message: l.message }))
    : sampleTestimonials;

  // Split into two columns for visual effect
  const column1 = displayTestimonials.filter((_, i) => i % 2 === 0);
  const column2 = displayTestimonials.filter((_, i) => i % 2 === 1);

  return (
    <>
      <motion.section
        id="loveletters"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full py-24 md:py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD6EB 60%, #FF6BD6 100%)',
        }}
      >
        {/* Animated gradient drift - subtle movement */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={shouldReduceMotion ? {} : {
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: 'radial-gradient(ellipse at 30% 30%, rgba(255, 107, 214, 0.2) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />

        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Testimonial Cards (Auto-scrolling) */}
            <div 
              ref={containerRef}
              className="relative h-[500px] overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Fade masks */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" 
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, transparent 100%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(255, 107, 214, 0.8) 0%, transparent 100%)' }}
              />
              
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="overflow-hidden">
                  <InfiniteMarquee items={column1} isPaused={isPaused} />
                </div>
                <div className="overflow-hidden mt-10">
                  <InfiniteMarquee items={column2} isPaused={isPaused} />
                </div>
              </div>
            </div>

            {/* Right - Title Section */}
            <motion.div 
              className="text-center lg:text-left flex flex-col items-center lg:items-start"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Decorative dots and line */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col gap-2.5">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: '#9333EA' }}
                      animate={shouldReduceMotion ? {} : {
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
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
              <p className="text-[#111111]/70 text-lg mb-8">
                Read from my customers
              </p>

              {/* Send Love Button */}
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: '0 8px 24px rgba(255, 47, 178, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-4 h-4" />
                Send Love
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <SendLoveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLetters}
      />
    </>
  );
}
