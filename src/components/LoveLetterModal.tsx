import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoveLetterModal({ isOpen, onClose, onSuccess }: LoveLetterModalProps) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length > 280) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('love_letters')
      .insert({
        message: message.trim(),
        name_or_role: name.trim() || null,
        user_type: userType || null,
        email: email.trim() || null,
      });

    if (!error) {
      setMessage('');
      setName('');
      setEmail('');
      setUserType('');
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ 
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-md p-6 rounded-2xl relative"
              style={{
                background: 'rgba(15, 20, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>

              <h3 className="text-lg font-medium text-white/90 mb-1">
                Leave a love letter to HumIQ
              </h3>
              <p className="text-sm text-white/60 mb-5">
                A short thought or feeling is perfect.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Message Field */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                  placeholder="This felt… / What surprised me was… / I liked that…"
                  className="w-full h-24 px-4 py-3 text-sm rounded-xl resize-none
                    bg-white/[0.05] border border-white/10 text-white/90
                    placeholder:text-white/40
                    focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                  required
                />

                {/* Name Field */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-white/[0.05] border border-white/10 text-white/90
                    placeholder:text-white/40
                    focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                />

                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (private, never shown)"
                    className="w-full px-4 py-3 text-sm rounded-xl
                      bg-white/[0.05] border border-white/10 text-white/90
                      placeholder:text-white/40
                      focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                  />
                </div>

                {/* User Type Select */}
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-white/[0.05] border border-white/10 text-white/90
                    focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50
                    [&>option]:bg-[#0D1117] [&>option]:text-white"
                >
                  <option value="">Select role (optional)</option>
                  <option value="Founder">🌱 Founder</option>
                  <option value="Hiring Manager">🧭 Hiring Manager</option>
                  <option value="Recruiter">🔍 Recruiter</option>
                  <option value="Talent">✨ Talent</option>
                  <option value="Other">💬 Other</option>
                </select>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm text-white/60 hover:text-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl
                      bg-gradient-to-r from-accent to-purple-500 text-black
                      hover:opacity-90 transition-all duration-200
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Love 💛'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
