import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface Round {
  id: string;
  session_id: string;
  item_id: string;
  started_at: string | null;
  ended_at: string | null;
  t_round: number | null;
  decision: string | null;
  outcome: string | null;
  winners_json: any | null;
  meta: any | null;
  // Joined data
  game_key?: string;
  user_id?: string;
  content?: any;
}

export interface RoundStats {
  totalRounds: number;
  uniqueSessions: number;
  avgRoundTime: number;
  roundsWithWinners: number;
  decisionBreakdown: Record<string, number>;
  gameBreakdown: Record<string, number>;
  timeDistribution: {
    range: string;
    count: number;
  }[];
}

export const useRounds = (filters?: {
  gameKey?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  return useQuery({
    queryKey: ['rounds', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('round')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(100);

        if (filters?.dateFrom) {
          query = query.gte('started_at', filters.dateFrom.toISOString());
        }
        if (filters?.dateTo) {
          query = query.lte('started_at', filters.dateTo.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          // Check if it's a permission error
          if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) {
            console.warn('Permission denied for rounds table, returning empty data');
            return [];
          }
          console.error('Error fetching rounds:', error);
          // Don't show toast for permission errors
          if (!error.message?.includes('permission')) {
            toast.error('Failed to fetch rounds');
          }
          return [];
        }

        return data as Round[];
      } catch (err) {
        console.error('Unexpected error fetching rounds:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useRoundStats = (filters?: {
  gameKey?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  return useQuery({
    queryKey: ['round-stats', filters],
    queryFn: async () => {
      // Get basic stats with limit for performance
      let statsQuery = supabase
        .from('round')
        .select('id, t_round, decision, session_id, winners_json', { count: 'exact' })
        .limit(1000);
      
      if (filters?.dateFrom) {
        statsQuery = statsQuery.gte('started_at', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        statsQuery = statsQuery.lte('started_at', filters.dateTo.toISOString());
      }

      const { data: rounds, count, error: statsError } = await statsQuery;

      if (statsError) {
        // Handle permission errors gracefully
        if (statsError.code === '42501' || statsError.message?.includes('permission') || statsError.message?.includes('RLS')) {
          console.warn('Permission denied for round stats, returning default data');
          return {
            totalRounds: 0,
            uniqueSessions: 0,
            avgRoundTime: 0,
            roundsWithWinners: 0,
            decisionBreakdown: {},
            gameBreakdown: {},
            timeDistribution: [
              { range: '0-10s', count: 0 },
              { range: '10-30s', count: 0 },
              { range: '30-60s', count: 0 },
              { range: '1-2m', count: 0 },
              { range: '2m+', count: 0 }
            ]
          } as RoundStats;
        }
        console.error('Error fetching round stats:', statsError);
        if (!statsError.message?.includes('permission')) {
          toast.error('Failed to fetch round statistics');
        }
        throw statsError;
      }

      // Get game breakdown - fetch sessions to get game_key
      let sessionsQuery = supabase
        .from('session')
        .select('id, game_key')
        .in('id', Array.from(new Set(rounds?.map(r => r.session_id) || [])));

      const { data: sessions, error: sessionError } = await sessionsQuery;

      if (sessionError) {
        console.error('Error fetching sessions for game breakdown:', sessionError);
      }

      // Calculate stats from rounds data
      const uniqueSessions = new Set(rounds?.map(r => r.session_id) || []).size;
      const avgRoundTime = rounds?.reduce((sum, r) => sum + (r.t_round || 0), 0) / (rounds?.length || 1);
      const roundsWithWinners = rounds?.filter(r => r.winners_json).length || 0;

      // Decision breakdown
      const decisionBreakdown: Record<string, number> = {};
      rounds?.forEach(r => {
        if (r.decision) {
          decisionBreakdown[r.decision] = (decisionBreakdown[r.decision] || 0) + 1;
        }
      });

      // Time distribution (buckets in seconds)
      const timeBuckets = [
        { min: 0, max: 10, label: '0-10s' },
        { min: 10, max: 30, label: '10-30s' },
        { min: 30, max: 60, label: '30-60s' },
        { min: 60, max: 120, label: '1-2m' },
        { min: 120, max: Infinity, label: '2m+' }
      ];

      const timeDistribution = timeBuckets.map(bucket => ({
        range: bucket.label,
        count: rounds?.filter(r => {
          const time = r.t_round || 0;
          return time >= bucket.min && time < bucket.max;
        }).length || 0
      }));

      // Create session to game_key map
      const sessionGameMap: Record<string, string> = {};
      sessions?.forEach((session: any) => {
        sessionGameMap[session.id] = session.game_key;
      });

      // Game breakdown from sessions
      const gameBreakdownMap: Record<string, number> = {};
      rounds?.forEach(r => {
        const gameKey = sessionGameMap[r.session_id];
        if (gameKey) {
          gameBreakdownMap[gameKey] = (gameBreakdownMap[gameKey] || 0) + 1;
        }
      });

      return {
        totalRounds: count || 0,
        uniqueSessions,
        avgRoundTime: Math.round(avgRoundTime * 10) / 10,
        roundsWithWinners,
        decisionBreakdown,
        gameBreakdown: gameBreakdownMap,
        timeDistribution
      } as RoundStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useRoundsByGame = () => {
  return useQuery({
    queryKey: ['rounds-by-game'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get recent rounds with their sessions
      const { data: rounds, error: roundError } = await supabase
        .from('round')
        .select('session_id')
        .gte('started_at', thirtyDaysAgo)
        .limit(1000);

      if (roundError) {
        if (roundError.code === '42501' || roundError.message?.includes('permission') || roundError.message?.includes('RLS')) {
          console.warn('Permission denied for rounds by game, returning empty data');
          return [];
        }
        console.error('Error fetching rounds:', roundError);
        return [];
      }

      // Get unique session IDs
      const sessionIds = Array.from(new Set(rounds?.map(r => r.session_id) || []));

      if (sessionIds.length === 0) return [];

      // Get sessions with game_key
      const { data: sessions, error: sessionError } = await supabase
        .from('session')
        .select('id, game_key')
        .in('id', sessionIds);

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        throw sessionError;
      }

      // Count rounds per game
      const gameCountMap: Record<string, number> = {};
      sessions?.forEach(session => {
        const roundsForSession = rounds?.filter(r => r.session_id === session.id).length || 0;
        gameCountMap[session.game_key] = (gameCountMap[session.game_key] || 0) + roundsForSession;
      });

      // Format as array
      return Object.entries(gameCountMap).map(([game_key, count]) => ({
        game_key,
        count
      }));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};