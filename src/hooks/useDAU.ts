import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface DailyActiveUsersData {
  date: string;
  dau: number;
  new_users: number;
  returning_users: number;
}

export const useDAU = (days: number = 30) => {
  return useQuery({
    queryKey: ['daily-active-users', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_active_users', {
        p_days: days
      });

      if (error) {
        console.error('Error fetching DAU:', error);
        toast.error('Failed to fetch daily active users');
        throw error;
      }

      return data as DailyActiveUsersData[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useDAUStats = (days: number = 30) => {
  return useQuery({
    queryKey: ['dau-stats', days],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_daily_active_users', {
        p_days: days
      });

      if (!data || data.length === 0) {
        return {
          currentDAU: 0,
          previousDAU: 0,
          trend: 0,
          avgDAU: 0,
          totalNewUsers: 0,
          totalReturningUsers: 0,
        };
      }

      // Calculate stats
      const currentDAU = data[0]?.dau || 0;
      const previousDAU = data[1]?.dau || 0;
      const trend = previousDAU > 0 ? ((currentDAU - previousDAU) / previousDAU) * 100 : 0;
      
      const avgDAU = Math.round(
        data.reduce((sum, day) => sum + day.dau, 0) / data.length
      );
      
      const totalNewUsers = data.reduce((sum, day) => sum + day.new_users, 0);
      const totalReturningUsers = data.reduce((sum, day) => sum + day.returning_users, 0);

      return {
        currentDAU,
        previousDAU,
        trend: Math.round(trend * 10) / 10,
        avgDAU,
        totalNewUsers,
        totalReturningUsers,
      };
    },
    refetchInterval: 5 * 60 * 1000,
  });
};