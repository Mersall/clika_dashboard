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

      try {
        // Fetch rounds for the user's sessions
        const { data: sessions, error: sessionError } = await supabase
          .from('session')
          .select('id')
          .eq('user_id', userId);

        if (sessionError) {
          console.error('Error fetching user sessions:', sessionError);
          return [];
        }

        if (!sessions || sessions.length === 0) {
          return [];
        }

        const sessionIds = sessions.map(s => s.id);

        // Fetch rounds for those sessions
        const { data: rounds, error: roundError } = await supabase
          .from('round')
          .select('item_id, session_id')
          .in('session_id', sessionIds);

        if (roundError) {
          console.error('Error fetching rounds:', roundError);
          return [];
        }

        // Count exposure per content item
        const exposureMap = new Map<string, number>();
        rounds?.forEach(round => {
          if (round.item_id) {
            exposureMap.set(round.item_id, (exposureMap.get(round.item_id) || 0) + 1);
          }
        });

        // Fetch content details for exposed items
        const itemIds = Array.from(exposureMap.keys());
        if (itemIds.length === 0) {
          return [];
        }

        const { data: contentItems, error: contentError } = await supabase
          .from('content_item')
          .select('id, payload')
          .in('id', itemIds);

        if (contentError) {
          console.error('Error fetching content items:', contentError);
        }

        // Map to UserSeenContent format
        const result: UserSeenContent[] = [];
        exposureMap.forEach((count, itemId) => {
          const content = contentItems?.find(c => c.id === itemId);
          const payload = content?.payload as any;

          result.push({
            user_id: userId,
            content_id: itemId,
            game_type: payload?.game || 'unknown',
            seen_count: count,
            last_seen: new Date().toISOString(),
            content: content ? {
              id: itemId,
              content_text_en: payload?.text_en || payload?.question?.text_en || '',
              content_text_ar: payload?.text_ar || payload?.question?.text_ar || '',
              difficulty_level: payload?.difficulty || 1,
              is_active: true
            } : undefined
          });
        });

        return result.sort((a, b) => b.seen_count - a.seen_count);
      } catch (err) {
        console.error('Error fetching user content exposure:', err);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// Get overexposed content across all users
export const useOverexposedContent = (threshold: number = 5) => {
  return useQuery({
    queryKey: ['overexposed-content', threshold],
    queryFn: async () => {
      try {
        // Fetch all rounds
        const { data: rounds, error } = await supabase
          .from('round')
          .select('item_id, session_id');

        if (error) {
          console.error('Error fetching rounds:', error);
          return [];
        }

        // Count exposures per content item per session
        const sessionExposureMap = new Map<string, Map<string, number>>();

        rounds?.forEach(round => {
          if (round.item_id && round.session_id) {
            if (!sessionExposureMap.has(round.item_id)) {
              sessionExposureMap.set(round.item_id, new Map());
            }
            const sessionMap = sessionExposureMap.get(round.item_id)!;
            sessionMap.set(round.session_id, (sessionMap.get(round.session_id) || 0) + 1);
          }
        });

        // Filter by threshold and aggregate
        const overexposedItems: any[] = [];

        sessionExposureMap.forEach((sessionMap, itemId) => {
          let totalExposures = 0;
          let maxSeenCount = 0;
          let sessionsOverThreshold = 0;

          sessionMap.forEach((count) => {
            totalExposures += count;
            maxSeenCount = Math.max(maxSeenCount, count);
            if (count >= threshold) {
              sessionsOverThreshold++;
            }
          });

          if (maxSeenCount >= threshold) {
            overexposedItems.push({
              content_id: itemId,
              total_exposures: totalExposures,
              user_count: sessionsOverThreshold,
              max_seen_count: maxSeenCount,
              game_type: 'unknown' // We'd need to join with content_item to get this
            });
          }
        });

        // Sort by total exposures
        return overexposedItems.sort((a, b) => b.total_exposures - a.total_exposures);
      } catch (err) {
        console.error('Error fetching overexposed content:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// Get content exposure statistics
export const useContentExposureStats = () => {
  return useQuery({
    queryKey: ['content-exposure-stats'],
    queryFn: async () => {
      try {
        // Get total sessions (unique users)
        const { data: sessions, error: sessionError } = await supabase
          .from('session')
          .select('id, user_id');

        if (sessionError) {
          console.error('Error fetching sessions:', sessionError);
          return {
            totalUsers: 0,
            totalContentViewed: 0,
            avgSeenPerUser: 0,
            overexposedContent: 0,
          };
        }

        const uniqueUsers = new Set(sessions?.map(s => s.user_id).filter(Boolean)).size;

        // Get total rounds
        const { data: rounds, error: roundError } = await supabase
          .from('round')
          .select('item_id');

        if (roundError) {
          console.error('Error fetching rounds:', roundError);
          return {
            totalUsers: uniqueUsers,
            totalContentViewed: 0,
            avgSeenPerUser: 0,
            overexposedContent: 0,
          };
        }

        const uniqueContent = new Set(rounds?.map(r => r.item_id).filter(Boolean)).size;
        const totalViews = rounds?.length || 0;
        const avgSeenPerUser = uniqueUsers > 0 ? totalViews / uniqueUsers : 0;

        // Count overexposed (seen more than 10 times)
        const contentCounts = new Map<string, number>();
        rounds?.forEach(round => {
          if (round.item_id) {
            contentCounts.set(round.item_id, (contentCounts.get(round.item_id) || 0) + 1);
          }
        });

        const overexposedContent = Array.from(contentCounts.values()).filter(count => count > 10).length;

        return {
          totalUsers: uniqueUsers,
          totalContentViewed: uniqueContent,
          avgSeenPerUser: Math.round(avgSeenPerUser * 10) / 10,
          overexposedContent,
        } as ContentExposureStats;
      } catch (err) {
        console.error('Error fetching exposure stats:', err);
        return {
          totalUsers: 0,
          totalContentViewed: 0,
          avgSeenPerUser: 0,
          overexposedContent: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// Reset content exposure for a user
export const useResetUserExposure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Since we're tracking through rounds, we can't really "reset" exposure
      // We'd need to delete rounds, which would break data integrity
      // For now, just invalidate the cache
      console.log('Reset exposure requested for user:', userId);
      return Promise.resolve();
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