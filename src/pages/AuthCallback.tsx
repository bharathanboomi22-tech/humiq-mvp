import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { setStoredCompanyId } from '@/lib/company';
import { setStoredTalentId } from '@/lib/talent';

type CallbackState = 'loading' | 'success' | 'error';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, setUserRole, role, refreshSession } = useAuth();
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setErrorMessage(error.message);
          setState('error');
          return;
        }

        if (!session?.user) {
          // Try to exchange the code
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (!accessToken) {
            setErrorMessage('No authentication token found');
            setState('error');
            return;
          }

          // Refresh session after getting token from URL
          await refreshSession();
        }

        // Get pending role from localStorage (set during login)
        const pendingRole = localStorage.getItem('humiq_pending_role') as 'company' | 'talent' | null;
        localStorage.removeItem('humiq_pending_role');

        if (pendingRole && session?.user) {
          // Set the user role
          try {
            await setUserRole(pendingRole);
          } catch (error) {
            console.error('Error setting user role:', error);
            // Role might already exist, continue anyway
          }

          // Link to existing profile if any
          if (pendingRole === 'company') {
            // Check if user already has a company linked
            const { data: existingCompany } = await supabase
              .from('companies')
              .select('id')
              .eq('user_id', session.user.id)
              .single();

            if (existingCompany) {
              setStoredCompanyId(existingCompany.id);
            }
          } else if (pendingRole === 'talent') {
            // Check if user already has a talent profile linked
            const { data: existingTalent } = await supabase
              .from('talent_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();

            if (existingTalent) {
              setStoredTalentId(existingTalent.id);
            }
          }

          setState('success');
          toast.success('Successfully signed in!');

          // Redirect based on role
          setTimeout(() => {
            if (pendingRole === 'company') {
              navigate('/company/dashboard');
            } else {
              navigate('/talent/dashboard');
            }
          }, 1500);
        } else if (role) {
          // User already has a role, redirect to appropriate dashboard
          setState('success');
          setTimeout(() => {
            if (role === 'company') {
              navigate('/company/dashboard');
            } else {
              navigate('/talent/dashboard');
            }
          }, 1000);
        } else {
          // No role set, need to choose
          setState('success');
          setTimeout(() => {
            navigate('/auth/login');
          }, 1500);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setErrorMessage('An unexpected error occurred');
        setState('error');
      }
    };

    handleCallback();
  }, [navigate, setUserRole, role, refreshSession]);

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
          Redirecting you to your dashboard...
        </p>
      </motion.div>
    </main>
  );
};

export default AuthCallback;
