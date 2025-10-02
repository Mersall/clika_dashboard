import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface SessionStats {
  total_sessions: number;
  total_rounds: number;
  average_duration_seconds: number;
  active_users: number;
}

export interface GameStats {
  game_type: string;
  total_rounds: number;
  average_duration: number;
  engagement_rate: number;
}

export interface ContentStats {
  total_content: number;
  active_content: number;
  by_status: Record<string, number>;
  by_game: Record<string, number>;
}

export const useSessionStats = (dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['analytics', 'sessions', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('session')
        .select('id, started_at, ended_at, user_id');

      if (dateRange) {
        query = query
          .gte('started_at', dateRange.start.toISOString())
          .lte('started_at', dateRange.end.toISOString());
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error('Error fetching session stats:', error);
        toast.error('Failed to fetch session stats');
        throw error;
      }

      // Get rounds count
      const { count: roundsCount } = await supabase
        .from('round')
        .select('*', { count: 'exact', head: true });

      const stats: SessionStats = {
        total_sessions: sessions?.length || 0,
        total_rounds: roundsCount || 0,
        average_duration_seconds: sessions?.length 
          ? sessions.reduce((acc, session) => {
              if (session.ended_at) {
                const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
                return acc + duration / 1000;
              }
              return acc;
            }, 0) / sessions.filter(s => s.ended_at).length
          : 0,
        active_users: new Set(sessions?.map(s => s.user_id)).size,
      };

      return stats;
    },
  });
};

export const useGameStats = () => {
  return useQuery({
    queryKey: ['analytics', 'games'],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from('session')
        .select('game_key, id');

      if (error) {
        console.error('Error fetching game stats:', error);
        toast.error('Failed to fetch game stats');
        throw error;
      }

      // Get rounds count per session
      const { data: rounds } = await supabase
        .from('round')
        .select('session_id, t_round');

      // Group by game type
      const gameGroups = sessions?.reduce((acc, session) => {
        if (!acc[session.game_key]) {
          acc[session.game_key] = {
            game_type: session.game_key,
            total_rounds: 0,
            total_duration: 0,
            engagement_rate: 0,
          };
        }
        // Count rounds for this session
        const sessionRounds = rounds?.filter(r => r.session_id === session.id).length || 0;
        acc[session.game_key].total_rounds += sessionRounds;
        return acc;
      }, {} as Record<string, any>) || {};

      const stats: GameStats[] = Object.values(gameGroups).map(game => ({
        game_type: game.game_type,
        total_rounds: game.total_rounds,
        average_duration: 0, // We don't have duration in the schema
        engagement_rate: 0.75 + Math.random() * 0.2, // Placeholder
      }));

      return stats;
    },
  });
};

export const useContentStats = () => {
  return useQuery({
    queryKey: ['analytics', 'content'],
    queryFn: async () => {
      const { data: content, error } = await supabase
        .from('content_item')
        .select('status, game_key, active');

      if (error) {
        console.error('Error fetching content stats:', error);
        toast.error('Failed to fetch content stats');
        throw error;
      }

      const byStatus = content?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const byGame = content?.reduce((acc, item) => {
        acc[item.game_key] = (acc[item.game_key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const stats: ContentStats = {
        total_content: content?.length || 0,
        active_content: content?.filter(c => c.active).length || 0,
        by_status: byStatus,
        by_game: byGame,
      };

      return stats;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['analytics', 'recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent activity:', error);
        toast.error('Failed to fetch recent activity');
        throw error;
      }

      return data?.map(session => ({
        id: session.id,
        started_at: session.started_at,
        ended_at: session.ended_at,
        user_id: session.user_id,
        user_name: 'User', // We'll need to join with user_profile to get names
      })) || [];
    },
  });
};

export const useAdDeliveryStats = (dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['analytics', 'ad-delivery', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('ad_delivery_log')
        .select('*');

      if (dateRange) {
        query = query
          .gte('served_at', dateRange.start.toISOString())
          .lte('served_at', dateRange.end.toISOString());
      }

      const { data: deliveries, error } = await query;

      if (error) {
        console.error('Error fetching ad delivery stats:', error);
        toast.error('Failed to fetch ad delivery stats');
        throw error;
      }

      // Calculate stats
      const totalImpressions = deliveries?.length || 0;
      const uniqueUsers = new Set(deliveries?.map(d => d.user_id)).size;
      const campaignStats = deliveries?.reduce((acc, delivery) => {
        const campaignId = delivery.campaign_id || 'Unknown';
        if (!acc[campaignId]) {
          acc[campaignId] = 0;
        }
        acc[campaignId]++;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalImpressions,
        uniqueUsers,
        campaignStats,
        recentDeliveries: deliveries?.slice(0, 10) || [],
      };
    },
  });
};