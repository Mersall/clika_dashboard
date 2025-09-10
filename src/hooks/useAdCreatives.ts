import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface AdCreative {
  id: string;
  campaign_id: string;
  text_lines: {
    [lang: string]: string[];
  };
  link: string | null;
  lang: string;
  active: boolean;
  created_at: string | null;
}

export const useAdCreatives = (campaignId: string) => {
  return useQuery({
    queryKey: ['ad-creatives', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_creative')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ad creatives:', error);
        toast.error('Failed to fetch ad creatives');
        throw error;
      }

      return data as AdCreative[];
    },
    enabled: !!campaignId,
  });
};

export const useCreateAdCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCreative: Omit<AdCreative, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('ad_creative')
        .insert([newCreative])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ad-creatives', data.campaign_id] });
      toast.success('Ad creative created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ad creative');
      console.error(error);
    },
  });
};

export const useUpdateAdCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, campaign_id, ...updates }: Partial<AdCreative> & { id: string; campaign_id: string }) => {
      const { data, error } = await supabase
        .from('ad_creative')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ad-creatives', data.campaign_id] });
      toast.success('Ad creative updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ad creative');
      console.error(error);
    },
  });
};

export const useDeleteAdCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, campaignId }: { id: string; campaignId: string }) => {
      const { error } = await supabase
        .from('ad_creative')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, campaignId };
    },
    onSuccess: ({ campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['ad-creatives', campaignId] });
      toast.success('Ad creative deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete ad creative');
      console.error(error);
    },
  });
};