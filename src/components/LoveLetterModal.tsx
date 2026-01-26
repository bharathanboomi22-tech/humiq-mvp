import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoveLetterModal({ isOpen, onClose, onSuccess }: LoveLetterModalProps) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [readyToPay, setReadyToPay] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isReadyToPay = readyToPay === 'yes';
  const canSubmit = message.trim() && isReadyToPay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length > 280 || !isReadyToPay) return;

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
      setReadyToPay('');
      setMonthlyAmount('');
      onSuccess?.();
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
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-md p-6 rounded-2xl relative glass-card max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-all duration-400 hover:bg-accent"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <h3 className="text-xl font-bold text-foreground mb-1 font-display">
                Leave a love letter to HumiQ
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                A short thought or feeling is perfect.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Message Field */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                  placeholder="This felt… / What surprised me was… / I liked that…"
                  className="w-full h-24 px-4 py-3 text-sm rounded-xl resize-none
                    bg-secondary text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-foreground/20
                    transition-all duration-400"
                  required
                />

                {/* Name Field */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-secondary text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-foreground/20
                    transition-all duration-400"
                />

                {/* Email Field */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (private, never shown)"
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-secondary text-foreground
                    placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-foreground/20
                    transition-all duration-400"
                />

                {/* User Type Select */}
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl
                    bg-secondary text-foreground
                    focus:outline-none focus:ring-2 focus:ring-foreground/20
                    transition-all duration-400"
                >
                  <option value="">Select role (optional)</option>
                  <option value="Founder">🌱 Founder</option>
                  <option value="Hiring Manager">🧭 Hiring Manager</option>
                  <option value="Recruiter">🔍 Recruiter</option>
                  <option value="Talent">✨ Talent</option>
                  <option value="Other">💬 Other</option>
                </select>

                {/* Divider */}
                <div className="border-t border-foreground/10 pt-4">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">
                    Payment Interest
                  </p>

                  {/* Ready to Pay Radio Group */}
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-3">
                    <Label className="text-sm text-foreground">
                      Are you ready to pay if product is live?
                    </Label>
                    <RadioGroup
                      value={readyToPay}
                      onValueChange={setReadyToPay}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ready-yes" />
                        <Label htmlFor="ready-yes" className="text-sm text-foreground cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ready-no" />
                        <Label htmlFor="ready-no" className="text-sm text-foreground cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Monthly Amount - Only show if ready to pay */}
                  <AnimatePresence>
                    {isReadyToPay && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 overflow-hidden"
                      >
                        <Label htmlFor="monthly-amount" className="text-sm text-muted-foreground mb-2 block">
                          How much are you ready to pay monthly? ($)
                        </Label>
                        <Input
                          id="monthly-amount"
                          type="number"
                          min="0"
                          step="1"
                          value={monthlyAmount}
                          onChange={(e) => setMonthlyAmount(e.target.value)}
                          placeholder="e.g., 29"
                          className="bg-secondary"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="px-6 py-2.5 text-sm font-medium rounded-full
                      bg-foreground text-background
                      hover:shadow-lg hover:-translate-y-0.5
                      transition-all duration-400
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isLoading ? 'Sending...' : 'Send Love Letter 💛'}
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
