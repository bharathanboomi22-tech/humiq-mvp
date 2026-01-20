import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const AuthRoleSelect = () => {
  const navigate = useNavigate();
  const { user, userType, isAuthenticated, isDemo, isLoading } = useAuth();

  // Redirect if already has a role
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated && !isDemo) {
      navigate('/auth/login');
      return;
    }

    if (userType === 'company') {
      navigate('/company/dashboard');
    } else if (userType === 'talent') {
      navigate('/talent/dashboard');
    }
  }, [userType, isAuthenticated, isDemo, isLoading, navigate]);

  const handleRoleSelect = (role: 'company' | 'talent') => {
    if (role === 'company') {
      navigate('/company/setup');
    } else {
      navigate('/talent/onboarding');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ambient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome to HumIQ
          </h1>
          <p className="text-muted-foreground">
            {user?.email ? `Signed in as ${user.email}` : 'Choose how you want to use HumIQ'}
          </p>
        </div>

        {/* Role Selection */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">I am a...</CardTitle>
            <CardDescription>
              Choose your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Option */}
            <button
              onClick={() => handleRoleSelect('company')}
              className="w-full p-6 rounded-xl border border-border/50 bg-background/50 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Building2 className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Company / Recruiter
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Post jobs, find talent, and conduct AI-powered interviews
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Talent Option */}
            <button
              onClick={() => handleRoleSelect('talent')}
              className="w-full p-6 rounded-xl border border-border/50 bg-background/50 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <User className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Talent / Developer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Build your profile, showcase skills, and get matched with opportunities
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          You can change this later in your settings
        </p>
      </motion.div>
    </main>
  );
};

export default AuthRoleSelect;
