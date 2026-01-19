import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export interface LoveLettersRef {
  expand: () => void;
}

interface LoveLettersProps {
  showButton?: boolean;
}

export const LoveLetters = forwardRef<LoveLettersRef, LoveLettersProps>(
  ({ showButton = false }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [letters, setLetters] = useState<LoveLetter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('');

    // Expose expand method to parent
    useImperativeHandle(ref, () => ({
      expand: () => setIsExpanded(true),
    }));

    // Fetch letters on mount and subscribe to realtime
    useEffect(() => {
      fetchLetters();

      // Subscribe to realtime inserts
      const channel = supabase
        .channel('love-letters-realtime')
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
              // Avoid duplicates (in case we just submitted it ourselves)
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim() || message.length > 280) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from('love_letters')
        .insert({
          message: message.trim(),
          name_or_role: name.trim() || null,
          user_type: userType || null,
          email: email.trim() || null,
        })
        .select()
        .single();

      if (!error && data) {
        setLetters((prev) => [data, ...prev]);
        setMessage('');
        setName('');
        setEmail('');
        setUserType('');
        setIsExpanded(false);
      }

      setIsLoading(false);
    };

    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        {/* Love Letters Button - only shown if showButton is true */}
        {showButton && (
          <>
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group px-5 py-2.5 rounded-full transition-all duration-300 ease-out"
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                backdropFilter: 'blur(12px)',
              }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium text-foreground/90">
                💌 HumIQ Love Letters
              </span>
            </motion.button>

            {/* Sub-microcopy */}
            <p className="mt-2 text-xs text-muted-foreground">
              Leave a note. Read what others felt.
            </p>
          </>
        )}

        {/* Expanded Input Card */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: showButton ? 24 : 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="w-full overflow-hidden"
            >
              <div 
                className="p-5 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <h3 className="text-base font-medium text-foreground/90 mb-1">
                  Leave a love letter to HumIQ
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  A short thought or feeling is perfect.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Message Field */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="This felt… / What surprised me was… / I liked that…"
                    className="w-full h-20 px-3 py-2.5 text-sm rounded-lg resize-none
                      bg-white/[0.04] border-0 text-foreground/90
                      placeholder:text-muted-foreground/60
                      focus:outline-none focus:ring-1 focus:ring-accent/50"
                    required
                  />

                  {/* Name Field */}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full px-3 py-2.5 text-sm rounded-lg
                      bg-white/[0.04] border-0 text-foreground/90
                      placeholder:text-muted-foreground/60
                      focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />

                  {/* Email Field */}
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (used only for follow-up, never shown publicly)"
                      className="w-full px-3 py-2.5 text-sm rounded-lg
                        bg-white/[0.04] border-0 text-foreground/90
                        placeholder:text-muted-foreground/60
                        focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                      We'll never display or sell your email.
                    </p>
                  </div>

                  {/* User Type Select */}
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg
                      bg-white/[0.04] border-0 text-foreground/90
                      focus:outline-none focus:ring-1 focus:ring-accent/50
                      [&>option]:bg-[#0D1117] [&>option]:text-foreground"
                  >
                    <option value="">Select role (optional)</option>
                    <option value="Founder">Founder</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Talent">Talent</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className="px-4 py-2 text-sm font-medium rounded-lg
                        bg-white/[0.08] text-foreground/90
                        hover:bg-white/[0.12] transition-all duration-200
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending...' : 'Send Love 💛'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Love Letter Wall */}
        {letters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full mt-8"
          >
            <h4 className="text-xs uppercase tracking-[0.1em] text-muted-foreground mb-4 text-center">
              What people are saying
            </h4>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {letters.map((letter, index) => (
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.45, 
                      ease: [0.2, 0.8, 0.2, 1],
                      delay: index < 5 ? index * 0.08 : 0
                    }}
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* Message */}
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {letter.message}
                    </p>

                    {/* Footer - Name OR Role + User Type Badge */}
                    {(letter.name_or_role || letter.user_type) && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06]">
                        {letter.name_or_role && (
                          <span className="text-xs text-muted-foreground">
                            {letter.name_or_role}
                          </span>
                        )}
                        {letter.user_type && (
                          <span className="text-xs" title={letter.user_type}>
                            {userTypeEmoji[letter.user_type] || '💬'}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    );
  }
);

LoveLetters.displayName = 'LoveLetters';
