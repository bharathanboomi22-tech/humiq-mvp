import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type CallbackState = 'loading' | 'success' | 'error';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { userType, isAuthenticated, refreshUserType } = useAuth();
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL hash (magic link)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setErrorMessage(error.message);
          setState('error');
          return;
        }

        if (!session?.user) {
          // Try to get token from URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (!accessToken) {
            setErrorMessage('No authentication token found');
            setState('error');
            return;
          }

          // Wait for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Refresh user type detection
        await refreshUserType();

        setState('success');
        toast.success('Successfully signed in!');

        // Wait a bit then check user type and redirect
        setTimeout(async () => {
          // MVP: Check localStorage for stored IDs instead of user_id column
          const storedCompanyId = localStorage.getItem('humiq_company_id');
          const storedTalentId = localStorage.getItem('humiq_talent_id');
          
          const company = storedCompanyId ? { id: storedCompanyId } : null;
          const talent = storedTalentId ? { id: storedTalentId } : null;

          if (company) {
            navigate('/company/dashboard');
          } else if (talent) {
            navigate('/talent/dashboard');
          } else {
            // No profile yet - go to role selection
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
  }, [navigate, refreshUserType]);

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
