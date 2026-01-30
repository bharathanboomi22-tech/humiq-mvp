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

export default function CompanyAuth() {
  const navigate = useNavigate();
  const { setUserType, setCompanyId } = useAuth();
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
          // Create company record (minimal, website_url required)
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              user_id: data.user.id,
              website_url: '', // Will be filled in onboarding
            })
            .select()
            .single();

          if (companyError) throw companyError;

          setUserType('company');
          setCompanyId(company.id);
          
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });

          // Route to onboarding
          navigate('/company/onboarding');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get company record
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select()
            .eq('user_id', data.user.id)
            .single();

          if (companyError && companyError.code !== 'PGRST116') {
            throw companyError;
          }

          setUserType('company');
          
          if (company) {
            setCompanyId(company.id);
            // Route based on setup status
            if (company.website_url && company.name) {
              navigate('/company/dashboard');
            } else {
              navigate('/company/onboarding');
            }
          } else {
            // Create company if doesn't exist
            const { data: newCompany, error: newCompanyError } = await supabase
              .from('companies')
              .insert({
                user_id: data.user.id,
                website_url: '',
              })
              .select()
              .single();

            if (newCompanyError) throw newCompanyError;
            
            setCompanyId(newCompany.id);
            navigate('/company/onboarding');
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
    <div className="min-h-screen bg-white flex flex-col">
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
          <span className="font-display text-xl font-extrabold tracking-tight">
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
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              For Companies
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100">
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
                  {mode === 'signup' ? 'Create your company account' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  {mode === 'signup' 
                    ? 'Stop screening resumes. Start making confident hiring decisions.'
                    : 'Your hiring intelligence is ready.'
                  }
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl pr-10"
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
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  )}

                  {/* Primary CTA */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-full text-base font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #FF2FB2 60%, #FF6BD6 100%)',
                    }}
                  >
                    {isLoading 
                      ? 'Please wait...' 
                      : mode === 'signup' 
                        ? 'Create company account' 
                        : 'Sign in to dashboard'
                    }
                  </Button>
                </form>

                {/* Switch Mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {mode === 'signup' ? 'Already have an account?' : 'New here?'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      className="font-medium text-purple-600 hover:underline"
                    >
                      {mode === 'signup' ? 'Sign in' : 'Create a company account'}
                    </button>
                  </p>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
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
                  className="w-full h-12 rounded-full text-base font-medium"
                >
                  {mode === 'signup' ? 'Sign in instead' : 'Create an account'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Trust Microcopy */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Humans make the decisions.<br />
            HumiQ helps you see clearly.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
