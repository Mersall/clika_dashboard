import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { mockRetentionCohorts } from '../mocks/retentionData';

export interface RetentionCohort {
  cohort_date: string;
  users_count: number;
  day_0: number;
  day_1: number;
  day_7: number;
  day_14: number;
  day_30: number;
}

export const useRetentionCohorts = (cohortSize: 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['retention-cohorts', cohortSize],
    queryFn: async () => {
      // Use mock data for now due to database function issue
      return mockRetentionCohorts;
      
      // TODO: Fix and use this when database function is available
      // const { data, error } = await supabase.rpc('get_retention_cohorts', {
      //   p_cohort_size: cohortSize
      // });

      // if (error) {
      //   console.error('Error fetching retention cohorts:', error);
      //   toast.error('Failed to fetch retention data');
      //   throw error;
      // }

      // return data as RetentionCohort[];
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useRetentionStats = (cohortSize: 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['retention-stats', cohortSize],
    queryFn: async () => {
      // Use mock data for now
      const data = mockRetentionCohorts;

      if (!data || data.length === 0) {
        return {
          avgDay1Retention: 0,
          avgDay7Retention: 0,
          avgDay30Retention: 0,
          totalCohorts: 0,
          totalUsers: 0,
          bestCohort: null,
        };
      }

      // Calculate average retention rates
      const validCohorts = data.filter((c: RetentionCohort) => c.users_count > 0);
      const avgDay1 = validCohorts.reduce((sum: number, c: RetentionCohort) => sum + c.day_1, 0) / validCohorts.length;
      const avgDay7 = validCohorts.reduce((sum: number, c: RetentionCohort) => sum + c.day_7, 0) / validCohorts.length;
      const avgDay30 = validCohorts.reduce((sum: number, c: RetentionCohort) => sum + c.day_30, 0) / validCohorts.length;
      
      // Find best performing cohort (by day 7 retention)
      const bestCohort = validCohorts.reduce((best: RetentionCohort | null, current: RetentionCohort) => {
        if (!best || current.day_7 > best.day_7) return current;
        return best;
      }, null);

      const totalUsers = validCohorts.reduce((sum: number, c: RetentionCohort) => sum + c.users_count, 0);

      return {
        avgDay1Retention: Math.round(avgDay1 * 10) / 10,
        avgDay7Retention: Math.round(avgDay7 * 10) / 10,
        avgDay30Retention: Math.round(avgDay30 * 10) / 10,
        totalCohorts: validCohorts.length,
        totalUsers,
        bestCohort,
      };
    },
    refetchInterval: 15 * 60 * 1000,
  });
};