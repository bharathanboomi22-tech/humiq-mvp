import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, ArrowLeft, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type UserType = 'company' | 'talent' | null;

const AuthLogin = () => {
  const navigate = useNavigate();
  const { signInWithMagicLink, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (role === 'company') {
      navigate('/company/dashboard');
    } else if (role === 'talent') {
      navigate('/talent/dashboard');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!userType) {
      toast.error('Please select your account type');
      return;
    }

    setIsLoading(true);

    try {
      // Store selected user type for after callback
      localStorage.setItem('humiq_pending_role', userType);
      
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        toast.error(error.message || 'Failed to send magic link');
        return;
      }

      setIsEmailSent(true);
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Error sending magic link:', error);
      toast.error('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="container max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-verdict-interview/10 mb-8">
              <CheckCircle className="w-10 h-10 text-verdict-interview" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-foreground mb-4">
              Check your email
            </h1>
            <p className="text-muted-foreground mb-8">
              We've sent a magic link to <span className="text-foreground font-medium">{email}</span>.
              Click the link in your email to sign in.
            </p>
            <Button variant="outline" onClick={() => setIsEmailSent(false)}>
              Use a different email
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient flex items-center justify-center">
      <div className="container max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Sign In to HumIQ</CardTitle>
              <CardDescription>
                Enter your email to receive a magic link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">I am a:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('company')}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        userType === 'company'
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border/50 bg-background/50 text-muted-foreground hover:border-accent/30'
                      }`}
                    >
                      <Building2 className="w-6 h-6" />
                      <span className="text-sm font-medium">Company</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('talent')}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        userType === 'talent'
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border/50 bg-background/50 text-muted-foreground hover:border-accent/30'
                      }`}
                    >
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">Talent</span>
                    </button>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-muted-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading || !email || !userType}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                No password required. We'll send you a secure link to sign in.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default AuthLogin;
