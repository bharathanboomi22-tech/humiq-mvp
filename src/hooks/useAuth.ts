import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'company' | 'talent' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUserRole: (role: 'company' | 'talent') => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // For MVP, we don't have a user_profiles table - just return null role
  const fetchUserRole = useCallback(async (_userId: string): Promise<UserRole> => {
    // In MVP phase without auth, we don't have user roles
    // Role could be determined by checking if user has a company or talent profile
    return null;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setState({
            user: session.user,
            session,
            role,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            session: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          role: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const role = await fetchUserRole(session.user.id);
          setState({
            user: session.user,
            session,
            role,
            isLoading: false,
            isAuthenticated: true,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

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
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Set user role (placeholder for when auth is fully implemented)
  const setUserRole = useCallback(async (role: 'company' | 'talent') => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    // For MVP, just update local state
    setState((prev) => ({ ...prev, role }));
  }, [state.user]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const role = await fetchUserRole(session.user.id);
      setState({
        user: session.user,
        session,
        role,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, [fetchUserRole]);

  return {
    ...state,
    signInWithMagicLink,
    signOut,
    setUserRole,
    refreshSession,
  };
}
