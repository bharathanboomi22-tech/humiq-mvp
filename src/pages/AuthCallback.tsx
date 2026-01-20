import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type CallbackState = 'loading' | 'success' | 'error';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const hasRun = useRef(false);

  // Handle redirect in separate effect
  useEffect(() => {
    if (redirectPath) {
      const timer = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectPath, navigate]);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;

    // Check for error in hash first
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    
    if (hashError) {
      console.error('Auth error from hash:', hashError, hashErrorDescription);
      setErrorMessage(hashErrorDescription || hashError);
      setState('error');
      return;
    }

    // Listen for auth state change - Supabase automatically handles the hash tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userId = session.user.id;

            // Check if user has existing profiles
            const [companyResult, talentResult] = await Promise.all([
              supabase.from('companies').select('id').eq('user_id', userId).maybeSingle(),
              supabase.from('talent_profiles').select('id').eq('user_id', userId).maybeSingle(),
            ]);

            setState('success');
            toast.success('Successfully signed in!');

            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);

            // Set redirect path based on user profile
            if (companyResult.data) {
              localStorage.setItem('humiq_company_id', companyResult.data.id);
              setRedirectPath('/company/dashboard');
            } else if (talentResult.data) {
              localStorage.setItem('humiq_talent_id', talentResult.data.id);
              setRedirectPath('/talent/dashboard');
            } else {
              setRedirectPath('/auth/role-select');
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error during auth callback:', error);
            setErrorMessage('Error setting up your account');
            setState('error');
          }
        }
      }
    );

    // Timeout fallback - if no auth event after 10s, show error
    const timeout = setTimeout(() => {
      setState(current => {
        if (current === 'loading') {
          setErrorMessage('Authentication timed out. The link may have expired.');
          return 'error';
        }
        return current;
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-display text-foreground">Signing you in...</h2>
          <p className="text-muted-foreground mt-2">Please wait a moment</p>
        </motion.div>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-destructive/10 mb-8">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-4">
            Authentication Failed
          </h1>
          <p className="text-muted-foreground mb-8">
            {errorMessage || 'Something went wrong during sign in.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button onClick={() => navigate('/auth/login')}>
              Try Again
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-verdict-interview/10 mb-8">
          <CheckCircle className="w-10 h-10 text-verdict-interview" />
        </div>
        <h1 className="text-2xl font-display font-semibold text-foreground mb-4">
          Welcome Back!
        </h1>
        <p className="text-muted-foreground">
          Redirecting you...
        </p>
      </motion.div>
    </main>
  );
};

export default AuthCallback;
