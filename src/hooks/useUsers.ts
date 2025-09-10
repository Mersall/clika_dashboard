import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface User {
  user_id: string;
  display_name: string | null;
  role: string | null;
  city_id: number | null;
  country_code: string | null;
  geo_consent: boolean | null;
  personalized_ads: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        throw error;
      }

      return (data || []) as User[];
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role, display_name }: { 
      id: string; 
      role?: string; 
      display_name?: string;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (role !== undefined) updates.role = role;
      if (display_name !== undefined) updates.display_name = display_name;

      const { error } = await supabase
        .from('user_profile')
        .update(updates)
        .eq('user_id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user');
      console.error(error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Note: We can't delete users from auth system
      // Just remove their profile
      const { error } = await supabase
        .from('user_profile')
        .delete()
        .eq('user_id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User profile removed');
    },
    onError: (error) => {
      toast.error('Failed to remove user profile');
      console.error(error);
    },
  });
};