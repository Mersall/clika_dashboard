import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface FeatureFlag {
  key: string;
  on_off_percent: number;
  audience?: string;
  updated_at: string;
}

export interface AudienceCriteria {
  countries?: string[];
  minSessions?: number;
  hasConsent?: {
    geo?: boolean;
    ads?: boolean;
  };
  roles?: string[];
  languages?: string[];
}

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flag')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching feature flags:', error);
        toast.error('Failed to fetch feature flags');
        throw error;
      }

      return data as FeatureFlag[];
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useFeatureFlag = (key: string) => {
  return useQuery({
    queryKey: ['feature-flag', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flag')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data as FeatureFlag;
    },
    enabled: !!key,
  });
};

export const useUpdateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      on_off_percent, 
      audience 
    }: { 
      key: string; 
      on_off_percent: number; 
      audience?: AudienceCriteria;
    }) => {
      const { error } = await supabase
        .from('feature_flag')
        .update({
          on_off_percent,
          audience: audience ? JSON.stringify(audience) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated');
    },
    onError: (error) => {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    },
  });
};

export const useCreateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      on_off_percent, 
      audience 
    }: { 
      key: string; 
      on_off_percent: number; 
      audience?: AudienceCriteria;
    }) => {
      const { error } = await supabase
        .from('feature_flag')
        .insert({
          key,
          on_off_percent,
          audience: audience ? JSON.stringify(audience) : null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag created');
    },
    onError: (error) => {
      console.error('Error creating feature flag:', error);
      toast.error('Failed to create feature flag');
    },
  });
};

export const useDeleteFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from('feature_flag')
        .delete()
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag deleted');
    },
    onError: (error) => {
      console.error('Error deleting feature flag:', error);
      toast.error('Failed to delete feature flag');
    },
  });
};