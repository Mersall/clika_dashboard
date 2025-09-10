import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  const isInitializedRef = useRef(false);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          isInitializedRef.current = true;
          setAuthState({
            user: session?.user ?? null,
            session: session,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          isInitializedRef.current = true;
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            error: error as AuthError,
          });
        }
      }
    };

    // Initialize immediately
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        // Only update state if initialized and mounted
        if (mounted && isInitializedRef.current) {
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null,
            session: session,
            error: null,
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for specific error cases
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email and confirm your account before signing in.');
        }
        throw error;
      }

      // Check if email is confirmed
      if (data.user && !data.user.confirmed_at) {
        // Sign out the unconfirmed user
        await supabase.auth.signOut();
        throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation link.');
      }

      // The session will be handled by onAuthStateChange
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error as AuthError,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      const needsConfirmation = !data.user?.confirmed_at;
      
      if (needsConfirmation) {
        // Sign out to prevent unconfirmed users from accessing the app
        await supabase.auth.signOut();
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      return { needsConfirmation };
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error as AuthError,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the session
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error as AuthError,
      }));
      
      // Force clear session even if sign out fails
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
      }));
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}