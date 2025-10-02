import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

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
      try {
        // Fetch all sessions with user info
        const { data: sessions, error } = await supabase
          .from('session')
          .select('user_id, started_at')
          .order('started_at', { ascending: false });

        if (error) {
          console.error('Error fetching retention data:', error);
          return [] as RetentionCohort[];
        }

        // Group sessions by cohort (week or month)
        const cohortMap = new Map<string, {
          users: Set<string>,
          firstSessionDate: string
        }>();

        sessions?.forEach(session => {
          if (session.user_id && session.started_at) {
            const date = new Date(session.started_at);
            let cohortKey: string;

            if (cohortSize === 'week') {
              // Get the Monday of the week
              const monday = new Date(date);
              const day = monday.getDay();
              const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
              monday.setDate(diff);
              cohortKey = monday.toISOString().split('T')[0];
            } else {
              // Get the first day of the month
              cohortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            }

            if (!cohortMap.has(cohortKey)) {
              cohortMap.set(cohortKey, {
                users: new Set(),
                firstSessionDate: session.started_at
              });
            }
            cohortMap.get(cohortKey)!.users.add(session.user_id);
          }
        });

        // Calculate retention for each cohort
        const cohorts: RetentionCohort[] = [];
        const now = new Date();

        cohortMap.forEach((cohortData, cohortDate) => {
          const cohortStart = new Date(cohortDate);
          const daysSinceCohort = Math.floor((now.getTime() - cohortStart.getTime()) / (1000 * 60 * 60 * 24));

          // Only include cohorts that are at least 30 days old for complete data
          if (daysSinceCohort >= 0) {
            const users = Array.from(cohortData.users);
            const userCount = users.length;

            // Calculate retention for each milestone
            const calculateRetention = (daysAfter: number) => {
              if (daysSinceCohort < daysAfter) return 0;

              const targetDate = new Date(cohortStart);
              targetDate.setDate(targetDate.getDate() + daysAfter);

              const retainedUsers = new Set<string>();
              sessions?.forEach(session => {
                if (session.user_id && users.includes(session.user_id)) {
                  const sessionDate = new Date(session.started_at);
                  const dayDiff = Math.floor((sessionDate.getTime() - cohortStart.getTime()) / (1000 * 60 * 60 * 24));
                  if (dayDiff === daysAfter) {
                    retainedUsers.add(session.user_id);
                  }
                }
              });

              return userCount > 0 ? (retainedUsers.size / userCount) * 100 : 0;
            };

            cohorts.push({
              cohort_date: cohortDate,
              users_count: userCount,
              day_0: 100, // Day 0 is always 100%
              day_1: calculateRetention(1),
              day_7: calculateRetention(7),
              day_14: calculateRetention(14),
              day_30: calculateRetention(30),
            });
          }
        });

        // Sort cohorts by date and return top 10
        return cohorts
          .sort((a, b) => new Date(b.cohort_date).getTime() - new Date(a.cohort_date).getTime())
          .slice(0, 10);
      } catch (err) {
        console.error('Error calculating retention cohorts:', err);
        return [] as RetentionCohort[];
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useRetentionStats = (cohortSize: 'week' | 'month' = 'week') => {
  const { data: cohorts } = useRetentionCohorts(cohortSize);

  return useQuery({
    queryKey: ['retention-stats', cohortSize],
    queryFn: async () => {
      // Use real cohort data
      const data = cohorts || [];

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
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};