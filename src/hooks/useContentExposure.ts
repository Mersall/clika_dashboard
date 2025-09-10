import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { mockUserSeenContent, mockContentExposureStats } from '../mocks/exposureData';

export interface UserSeenContent {
  user_id: string;
  content_id: string;
  game_type: string;
  seen_count: number;
  last_seen: string;
  content?: {
    id: string;
    content_text_en: string;
    content_text_ar: string;
    difficulty_level: number;
    is_active: boolean;
  };
  user?: {
    display_name: string;
    email: string;
  };
}

export interface ContentExposureStats {
  totalUsers: number;
  totalContentViewed: number;
  avgSeenPerUser: number;
  overexposedContent: number;
}

// Get content exposure for a specific user
export const useUserContentExposure = (userId?: string) => {
  return useQuery({
    queryKey: ['user-content-exposure', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Use mock data for now
      return mockUserSeenContent.filter(item => item.user_id === userId);

      // TODO: Use real data when available
      // const { data, error } = await supabase
      //   .from('user_seen_today')
      //   .select(`
      //     *,
      //     content:content_id (
      //       id,
      //       content_text_en,
      //       content_text_ar,
      //       difficulty_level,
      //       is_active
      //     )
      //   `)
      //   .eq('user_id', userId)
      //   .order('seen_count', { ascending: false });

      // if (error) {
      //   console.error('Error fetching user content exposure:', error);
      //   toast.error('Failed to fetch content exposure');
      //   throw error;
      // }

      // return data as UserSeenContent[];
    },
    enabled: !!userId,
  });
};

// Get overexposed content across all users
export const useOverexposedContent = (threshold: number = 5) => {
  return useQuery({
    queryKey: ['overexposed-content', threshold],
    queryFn: async () => {
      // Use mock data for now
      const filteredData = mockUserSeenContent.filter(item => item.seen_count >= threshold);
      
      // Group by content_id and aggregate stats
      const contentMap = new Map();
      filteredData.forEach((item: any) => {
        const id = item.content_id;
        if (!contentMap.has(id)) {
          contentMap.set(id, {
            content_id: id,
            content: item.content,
            game_type: item.game_type,
            total_exposures: 0,
            user_count: 0,
            max_seen_count: 0,
          });
        }
        const existing = contentMap.get(id);
        existing.total_exposures += item.seen_count;
        existing.user_count += 1;
        existing.max_seen_count = Math.max(existing.max_seen_count, item.seen_count);
      });

      return Array.from(contentMap.values());
    },
  });
};

// Get content exposure statistics
export const useContentExposureStats = () => {
  return useQuery({
    queryKey: ['content-exposure-stats'],
    queryFn: async () => {
      // Use mock data for now
      return mockContentExposureStats;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Reset content exposure for a user
export const useResetUserExposure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_seen_today')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-content-exposure'] });
      queryClient.invalidateQueries({ queryKey: ['content-exposure-stats'] });
      toast.success('User content exposure reset');
    },
    onError: (error) => {
      console.error('Error resetting exposure:', error);
      toast.error('Failed to reset exposure');
    },
  });
};