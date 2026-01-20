import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserType = 'company' | 'talent' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  userType: UserType;
  companyId: string | null;
  talentId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
}

interface UseAuthReturn extends AuthState {
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: (type: 'company' | 'talent') => void;
  exitDemoMode: () => void;
  refreshUserType: () => Promise<void>;
}

const DEMO_COMPANY_KEY = 'humiq_demo_company_id';
const DEMO_TALENT_KEY = 'humiq_demo_talent_id';
const DEMO_MODE_KEY = 'humiq_demo_mode';

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userType: null,
    companyId: null,
    talentId: null,
    isLoading: true,
    isAuthenticated: false,
    isDemo: false,
  });

  // Check if user has a company or talent profile
  const detectUserType = useCallback(async (userId: string): Promise<{
    userType: UserType;
    companyId: string | null;
    talentId: string | null;
  }> => {
    try {
      // Check for company profile linked to the user
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (company) {
        localStorage.setItem('humiq_company_id', company.id);
        return { userType: 'company', companyId: company.id, talentId: null };
      }

      // Check for talent profile linked to the user
      const { data: talent } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (talent) {
        localStorage.setItem('humiq_talent_id', talent.id);
        return { userType: 'talent', companyId: null, talentId: talent.id };
      }

      // User exists but no profile yet
      return { userType: null, companyId: null, talentId: null };
    } catch (error) {
      console.error('Error detecting user type:', error);
      return { userType: null, companyId: null, talentId: null };
    }
  }, []);

  // Check for demo mode on init
  const checkDemoMode = useCallback(() => {
    const demoMode = localStorage.getItem(DEMO_MODE_KEY);
    if (demoMode === 'company') {
      const companyId = localStorage.getItem(DEMO_COMPANY_KEY);
      return { isDemo: true, userType: 'company' as UserType, companyId, talentId: null };
    } else if (demoMode === 'talent') {
      const talentId = localStorage.getItem(DEMO_TALENT_KEY);
      return { isDemo: true, userType: 'talent' as UserType, companyId: null, talentId };
    }
    return { isDemo: false, userType: null, companyId: null, talentId: null };
  }, []);

  // Track if initialization has run (for React Strict Mode)
  const hasInitialized = useRef(false);

  // Initialize auth state
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // First check for demo mode
        const demoState = checkDemoMode();
        if (demoState.isDemo) {
          if (isMounted) {
            setState({
              user: null,
              session: null,
              userType: demoState.userType,
              companyId: demoState.companyId,
              talentId: demoState.talentId,
              isLoading: false,
              isAuthenticated: false,
              isDemo: true,
            });
          }
          return;
        }

        // Check for real session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          const { userType, companyId, talentId } = await detectUserType(session.user.id);
          if (isMounted) {
            setState({
              user: session.user,
              session,
              userType,
              companyId,
              talentId,
              isLoading: false,
              isAuthenticated: true,
              isDemo: false,
            });
          }
        } else {
          if (isMounted) {
            setState({
              user: null,
              session: null,
              userType: null,
              companyId: null,
              talentId: null,
              isLoading: false,
              isAuthenticated: false,
              isDemo: false,
            });
          }
        }
      } catch (error) {
        // Ignore abort errors (component unmounted)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setState({
            user: null,
            session: null,
            userType: null,
            companyId: null,
            talentId: null,
            isLoading: false,
            isAuthenticated: false,
            isDemo: false,
          });
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          // Clear demo mode on real sign in
          localStorage.removeItem(DEMO_MODE_KEY);
          localStorage.removeItem(DEMO_COMPANY_KEY);
          localStorage.removeItem(DEMO_TALENT_KEY);

          try {
            const { userType, companyId, talentId } = await detectUserType(session.user.id);
            if (isMounted) {
              setState({
                user: session.user,
                session,
                userType,
                companyId,
                talentId,
                isLoading: false,
                isAuthenticated: true,
                isDemo: false,
              });
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error detecting user type on sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setState({
              user: null,
              session: null,
              userType: null,
              companyId: null,
              talentId: null,
              isLoading: false,
              isAuthenticated: false,
              isDemo: false,
            });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [detectUserType, checkDemoMode]);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    // Clear demo mode
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_COMPANY_KEY);
    localStorage.removeItem(DEMO_TALENT_KEY);

    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      userType: null,
      companyId: null,
      talentId: null,
      isLoading: false,
      isAuthenticated: false,
      isDemo: false,
    });
  }, []);

  // Enter demo mode (for testing without auth)
  const enterDemoMode = useCallback((type: 'company' | 'talent') => {
    localStorage.setItem(DEMO_MODE_KEY, type);
    
    if (type === 'company') {
      // Check for existing demo company or will be created
      const existingId = localStorage.getItem(DEMO_COMPANY_KEY);
      setState({
        user: null,
        session: null,
        userType: 'company',
        companyId: existingId,
        talentId: null,
        isLoading: false,
        isAuthenticated: false,
        isDemo: true,
      });
    } else {
      // Check for existing demo talent or will be created
      const existingId = localStorage.getItem(DEMO_TALENT_KEY);
      setState({
        user: null,
        session: null,
        userType: 'talent',
        companyId: null,
        talentId: existingId,
        isLoading: false,
        isAuthenticated: false,
        isDemo: true,
      });
    }
  }, []);

  // Exit demo mode
  const exitDemoMode = useCallback(() => {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_COMPANY_KEY);
    localStorage.removeItem(DEMO_TALENT_KEY);
    setState({
      user: null,
      session: null,
      userType: null,
      companyId: null,
      talentId: null,
      isLoading: false,
      isAuthenticated: false,
      isDemo: false,
    });
  }, []);

  // Refresh user type detection
  const refreshUserType = useCallback(async () => {
    if (state.isDemo) {
      const demoState = checkDemoMode();
      setState(prev => ({
        ...prev,
        companyId: demoState.companyId,
        talentId: demoState.talentId,
      }));
      return;
    }

    if (!state.user) return;

    const { userType, companyId, talentId } = await detectUserType(state.user.id);
    setState(prev => ({
      ...prev,
      userType,
      companyId,
      talentId,
    }));
  }, [state.user, state.isDemo, detectUserType, checkDemoMode]);

  return {
    ...state,
    signInWithMagicLink,
    signOut,
    enterDemoMode,
    exitDemoMode,
    refreshUserType,
  };
}

// Auth Context for provider pattern
interface AuthContextType extends UseAuthReturn {}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
