import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the hash fragment from magic link
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // If we have tokens in the hash, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setErrorMessage(sessionError.message);
            setState('error');
            return;
          }
        }

        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setErrorMessage(error.message);
          setState('error');
          return;
        }

        if (!session?.user) {
          setErrorMessage('No authentication session found');
          setState('error');
          return;
        }

        const userId = session.user.id;

        // Check if user has existing profiles linked to their user_id
        const [companyResult, talentResult] = await Promise.all([
          supabase.from('companies').select('id').eq('user_id', userId).maybeSingle(),
          supabase.from('talent_profiles').select('id').eq('user_id', userId).maybeSingle(),
        ]);

        setState('success');
        toast.success('Connexion réussie !');

        // Redirect based on user profile
        setTimeout(() => {
          if (companyResult.data) {
            // User has a company profile
            navigate('/company/dashboard');
          } else if (talentResult.data) {
            // User has a talent profile
            navigate('/talent/dashboard');
          } else {
            // New user - go to role selection then onboarding
            navigate('/auth/role-select');
          }
        }, 1500);
      } catch (error) {
        console.error('Callback error:', error);
        setErrorMessage('An unexpected error occurred');
        setState('error');
      }
    };

    handleCallback();
  }, [navigate]);

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
