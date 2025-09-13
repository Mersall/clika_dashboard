import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface ContentItem {
  id: string;
  game_key: string;
  payload: any;
  tags: string[] | null;
  difficulty_or_depth: string | null;
  status: string | null;
  active: boolean | null;
  similarity_group: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useContent = (gameKey?: string) => {
  return useQuery({
    queryKey: ['content', gameKey],
    queryFn: async () => {
      let query = supabase
        .from('content_item')
        .select('*')
        .order('created_at', { ascending: false });

      if (gameKey && gameKey !== 'all') {
        query = query.eq('game_key', gameKey);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching content:', error);
        toast.error(`Failed to fetch content: ${error.message}`);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} content items for game: ${gameKey || 'all'}`);
      return data as ContentItem[];
    },
  });
};

export const useContentItem = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_item')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ContentItem;
    },
    enabled: !!id,
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContent: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('content_item')
        .insert([newContent])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create content');
      console.error(error);
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_item')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (error) => {
      console.error('Update content error:', error);
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_item')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete content');
      console.error(error);
    },
  });
};