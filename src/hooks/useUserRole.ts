import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@services/supabase';

interface UserProfile {
  user_id: string;
  display_name?: string;
  role?: 'admin' | 'editor' | 'reviewer' | 'advertiser' | 'analyst' | 'dashboard_admin' | 'super_admin' | 'dashboard_viewer';
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Create a default profile if none exists
          const defaultProfile: UserProfile = {
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            role: 'reviewer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUserProfile(defaultProfile);
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const role = userProfile?.role || 'reviewer';
  const isAdmin = role === 'admin' || role === 'dashboard_admin' || role === 'super_admin';
  const isEditor = role === 'editor' || isAdmin;
  const isReviewer = role === 'reviewer' || role === 'dashboard_viewer' || isEditor || isAdmin;

  return {
    userProfile,
    role,
    isAdmin,
    isEditor,
    isReviewer,
    loading,
  };
}