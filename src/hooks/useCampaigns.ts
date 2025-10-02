import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface Campaign {
  id: string;
  name: string;
  status: string | null;
  start_at: string;
  end_at: string;
  daily_cap: number | null;
  sov_pct: number | null;
  priority: number | null;
  geo_scope: string | null;
  geo_targets: any | null;
  lang: string | null;
  daypart: any | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaign')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        // Don't throw error - return empty array to prevent infinite loading
        // This could be due to RLS policies or missing table
        return [] as Campaign[];
      }

      console.log(`Fetched ${data?.length || 0} campaigns`);
      return data as Campaign[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaign')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCampaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ad_campaign')
        .insert([newCampaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error(error);
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('ad_campaign')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update campaign');
      console.error(error);
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_campaign')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete campaign');
      console.error(error);
    },
  });
};