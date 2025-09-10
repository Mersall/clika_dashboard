import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@services/supabase';
import { useNavigate } from 'react-router-dom';
import { debugAuthState } from '@/utils/auth-debug';

interface UserProfile {
  user_id: string;
  display_name?: string;
  role?: 'admin' | 'editor' | 'reviewer' | 'advertiser' | 'analyst';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile | null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Create or update user profile
  const upsertUserProfile = async (userId: string, email: string, metadata?: any) => {
    try {
      const existingProfile = await fetchUserProfile(userId);
      
      if (!existingProfile) {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profile')
          .insert({
            user_id: userId,
            display_name: metadata?.display_name || email.split('@')[0],
            role: metadata?.role || 'reviewer'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          return null;
        }

        return data as UserProfile;
      }

      return existingProfile;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return null;
    }
  };

  // Handle session updates
  const handleSessionUpdate = useCallback(async (newSession: Session | null) => {
    console.log('AuthContext: Handling session update:', !!newSession);
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession?.user) {
      const profile = await fetchUserProfile(newSession.user.id);
      if (!profile && newSession.user.email) {
        const newProfile = await upsertUserProfile(
          newSession.user.id,
          newSession.user.email,
          newSession.user.user_metadata
        );
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        debugAuthState('Initialization Start');
        
        // First, try to get session from Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          debugAuthState('Session Error');
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('AuthContext: Got session response:', !!currentSession);
        debugAuthState('After getSession');
        
        if (!mounted) return;
        
        // Handle the session
        await handleSessionUpdate(currentSession);
        
        // Set loading to false
        setLoading(false);
        console.log('AuthContext: Initialization complete');
        
      } catch (error) {
        console.error('AuthContext: Error during initialization:', error);
        debugAuthState('Init Error');
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Set a timeout to prevent infinite loading
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.error('AuthContext: Init timeout reached');
        debugAuthState('Timeout');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    // Initialize immediately
    initializeAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, !!session);
      debugAuthState(`Auth State Change: ${event}`);
      
      if (!mounted) return;
      
      // Handle all events, not just non-INITIAL_SESSION
      await handleSessionUpdate(session);
      
      // Make sure loading is false after any auth state change
      if (loading) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [handleSessionUpdate, loading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    navigate('/');
  };

  const signInWithProvider = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) throw error;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      // Clear state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Force a hard refresh to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('SignOut error:', error);
      // Still try to navigate even if there's an error
      window.location.href = '/login';
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('user_profile')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setUserProfile(data as UserProfile);
  };

  // Role checks based on user profile from database
  const userRole = userProfile?.role || user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || isAdmin;
  const isReviewer = userRole === 'reviewer' || isEditor;

  const value = {
    session,
    user,
    loading,
    userProfile,
    signIn,
    signInWithProvider,
    signOut,
    updateProfile,
    isAdmin,
    isEditor,
    isReviewer,
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