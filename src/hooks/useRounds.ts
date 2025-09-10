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
      let query = supabase
        .from('round')
        .select(`
          *,
          session:session_id (
            game_key,
            user_id,
            device_id
          ),
          content:item_id (
            game_key,
            payload,
            difficulty_or_depth
          )
        `)
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
        console.error('Error fetching rounds:', error);
        toast.error('Failed to fetch rounds');
        throw error;
      }

      return data as Round[];
    },
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
        console.error('Error fetching round stats:', statsError);
        toast.error('Failed to fetch round statistics');
        throw statsError;
      }

      // Get game breakdown
      let gameQuery = supabase.rpc('get_round_game_breakdown', {
        start_date: filters?.dateFrom?.toISOString() || '2020-01-01',
        end_date: filters?.dateTo?.toISOString() || new Date().toISOString()
      });

      const { data: gameBreakdown, error: gameError } = await gameQuery;

      if (gameError) {
        console.error('Error fetching game breakdown:', gameError);
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

      // Game breakdown from RPC or fallback
      const gameBreakdownMap: Record<string, number> = {};
      if (gameBreakdown && Array.isArray(gameBreakdown)) {
        gameBreakdown.forEach((item: any) => {
          gameBreakdownMap[item.game_key] = item.count;
        });
      }

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
  });
};

export const useRoundsByGame = () => {
  return useQuery({
    queryKey: ['rounds-by-game'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_round_game_breakdown', {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      });

      if (error) {
        console.error('Error fetching rounds by game:', error);
        throw error;
      }

      return data;
    },
  });
};