import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Building2, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const AuthLogin = () => {
  const navigate = useNavigate();
  const { signInWithMagicLink, enterDemoMode, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(email.trim());
      
      if (error) {
        toast.error(error.message || 'Failed to send magic link');
        return;
      }

      setEmailSent(true);
      toast.success('Check your email for the magic link!');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = (type: 'company' | 'talent') => {
    enterDemoMode(type);
    if (type === 'company') {
      navigate('/company/setup');
    } else {
      navigate('/talent/onboarding');
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            HumIQ
          </h1>
          <p className="text-muted-foreground">
            Work Evidence Platform
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Magic Link Card */}
            <Card className="glass-card mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome</CardTitle>
                <CardDescription>
                  Sign in with your email to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Magic Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  or try demo mode
                </span>
              </div>
            </div>

            {/* Demo Mode Cards */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDemoMode('company')}
                className="glass-card p-4 text-left group hover:border-accent/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="font-medium text-foreground text-sm">Company Demo</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Post jobs & find talent</p>
              </button>

              <button
                onClick={() => handleDemoMode('talent')}
                className="glass-card p-4 text-left group hover:border-accent/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="font-medium text-foreground text-sm">Talent Demo</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Build your profile</p>
              </button>
            </div>

            {/* Demo mode note */}
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo mode doesn't require authentication
            </p>
          </>
        ) : (
          /* Email Sent Confirmation */
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-muted-foreground mb-6">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Click the link in your email to sign in. The link expires in 1 hour.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Use a different email
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </main>
  );
};

export default AuthLogin;
