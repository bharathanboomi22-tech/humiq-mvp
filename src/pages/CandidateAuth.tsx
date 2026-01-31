import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

type AuthMode = 'signup' | 'signin';

export default function CandidateAuth() {
  const navigate = useNavigate();
  const { setUserType, setTalentId } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast({
            title: 'Passwords do not match',
            description: 'Please make sure your passwords match.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: 'Password too short',
            description: 'Password must be at least 6 characters.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create talent profile
          const { data: profile, error: profileError } = await supabase
            .from('talent_profiles')
            .insert({
              user_id: data.user.id,
              email: email,
            })
            .select()
            .single();

          if (profileError) throw profileError;

          setUserType('talent');
          setTalentId(profile.id);
          
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });

          // Route to onboarding
          navigate('/talent/onboarding');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get talent profile
          const { data: profile, error: profileError } = await supabase
            .from('talent_profiles')
            .select()
            .eq('user_id', data.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          setUserType('talent');
          
          if (profile) {
            setTalentId(profile.id);
            // Route based on onboarding status
            if (profile.onboarding_completed) {
              navigate('/talent/dashboard');
            } else {
              navigate('/talent/onboarding');
            }
          } else {
            // Create profile if doesn't exist
            const { data: newProfile, error: newProfileError } = await supabase
              .from('talent_profiles')
              .insert({
                user_id: data.user.id,
                email: email,
              })
              .select()
              .single();

            if (newProfileError) throw newProfileError;
            
            setTalentId(newProfile.id);
            navigate('/talent/onboarding');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </button>
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
            HumiQ
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Context Label */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              For Candidates
            </span>
          </div>

          {/* Card */}
          <div className="glass-card rounded-[24px] p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Title */}
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {mode === 'signup' ? 'Create your HumiQ profile' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  {mode === 'signup' 
                    ? "This isn't a resume. It's how companies understand how you think and work."
                    : 'Your work, your thinking, your progress — all here.'
                  }
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl pr-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Primary CTA */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-full text-base font-bold btn-primary"
                  >
                    {isLoading 
                      ? 'Please wait...' 
                      : mode === 'signup' 
                        ? 'Create account' 
                        : 'Sign in'
                    }
                  </Button>
                </form>

                {/* Switch Mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {mode === 'signup' ? 'Already have an account?' : 'New to HumIQ?'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      className="font-medium text-primary hover:underline"
                    >
                      {mode === 'signup' ? 'Sign in' : 'Create an account'}
                    </button>
                  </p>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Secondary Action */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full h-12 rounded-full text-base font-medium border-border/30 text-foreground hover:bg-secondary/50"
                >
                  {mode === 'signup' ? 'Sign in instead' : 'Create an account'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Microcopy */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            No resumes. No applications. Just real work.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
