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

  // Fetch user role from user_profiles table
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role as UserRole;
    } catch {
      return null;
    }
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

  // Set user role (called after signup to choose role)
  const setUserRole = useCallback(async (role: 'company' | 'talent') => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: state.user.id,
        role,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to set user role: ${error.message}`);
    }

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
