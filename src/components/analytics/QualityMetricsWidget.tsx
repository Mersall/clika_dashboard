import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { CheckCircleIcon, ShieldCheckIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface QualityMetrics {
  antiRepetitionRate: number;
  liveContentCompliance: number;
  contentCoverage: number;
  dailySeenAverage: number;
  noRepeatSessions: number;
  totalSessions: number;
}

export function QualityMetricsWidget() {
  const { t } = useTranslation();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['quality-metrics'],
    queryFn: async () => {
      // Get today's date in Cairo timezone
      const cairoDate = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Africa/Cairo'
      });

      // Get sessions from today
      const todayStart = new Date(cairoDate);
      todayStart.setHours(0, 0, 0, 0);

      const { data: sessions, error: sessionError } = await supabase
        .from('session')
        .select('id, user_id')
        .gte('started_at', todayStart.toISOString())
        .order('started_at', { ascending: false })
        .limit(100);

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
      }

      // Get rounds from today's sessions
      const sessionIds = sessions?.map(s => s.id) || [];
      let roundsData = null;

      if (sessionIds.length > 0) {
        const { data: rounds, error: roundsError } = await supabase
          .from('round')
          .select('session_id, item_id')
          .in('session_id', sessionIds);

        if (!roundsError) {
          roundsData = rounds;
        }
      }

      // Check for repeated items within sessions
      let noRepeatSessions = 0;
      const sessionItemMap = new Map<string, Set<string>>();

      roundsData?.forEach(round => {
        if (!sessionItemMap.has(round.session_id)) {
          sessionItemMap.set(round.session_id, new Set());
        }
        sessionItemMap.get(round.session_id)?.add(round.item_id);
      });

      sessionItemMap.forEach((items, sessionId) => {
        // If unique items equals total items, no repetition occurred
        if (items.size === roundsData?.filter(r => r.session_id === sessionId).length) {
          noRepeatSessions++;
        }
      });

      // Get content stats for compliance
      const { data: contentStats, error: contentError } = await supabase
        .from('content_item')
        .select('status, active')
        .eq('active', true);

      const liveContent = contentStats?.filter(c => c.status === 'live').length || 0;
      const totalActive = contentStats?.length || 0;

      // Get user seen today stats
      const { data: userSeenToday } = await supabase
        .from('user_seen_today')
        .select('item_ids')
        .eq('date', cairoDate)
        .limit(50);

      const totalItemsSeen = userSeenToday?.reduce((acc, user) => {
        return acc + (user.item_ids?.length || 0);
      }, 0) || 0;

      const avgSeenPerUser = userSeenToday?.length
        ? Math.round(totalItemsSeen / userSeenToday.length)
        : 0;

      // Calculate metrics
      const totalSessions = sessions?.length || 0;
      const antiRepetitionRate = totalSessions > 0
        ? (noRepeatSessions / totalSessions) * 100
        : 100;

      const liveContentCompliance = totalActive > 0
        ? (liveContent / totalActive) * 100
        : 100;

      // Content coverage (percentage of total content seen today)
      const { count: totalContentCount } = await supabase
        .from('content_item')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live')
        .eq('active', true);

      const uniqueItemsSeen = new Set(
        userSeenToday?.flatMap(u => u.item_ids || [])
      ).size;

      const contentCoverage = totalContentCount && totalContentCount > 0
        ? (uniqueItemsSeen / totalContentCount) * 100
        : 0;

      return {
        antiRepetitionRate,
        liveContentCompliance,
        contentCoverage,
        dailySeenAverage: avgSeenPerUser,
        noRepeatSessions,
        totalSessions
      } as QualityMetrics;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quality Metrics</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value >= 95) return 'text-green-400';
    if (value >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (value: number) => {
    if (value >= 95) return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
    if (value >= 80) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">Backend Quality Metrics</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Anti-Repetition Success */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Anti-Repetition</span>
            </div>
            {getStatusIcon(metrics?.antiRepetitionRate || 0)}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.antiRepetitionRate || 0)}`}>
            {metrics?.antiRepetitionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics?.noRepeatSessions}/{metrics?.totalSessions} sessions
          </div>
        </div>

        {/* Live Content Compliance */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Live Content</span>
            </div>
            {getStatusIcon(metrics?.liveContentCompliance || 0)}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.liveContentCompliance || 0)}`}>
            {metrics?.liveContentCompliance.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Compliance rate
          </div>
        </div>

        {/* Content Coverage */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Coverage</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics?.contentCoverage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Content seen today
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-indigo-400" />
              <span className="text-sm text-gray-400">Daily Average</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {metrics?.dailySeenAverage}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Items per user
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-300">
            Backend system: <span className="font-semibold text-green-400">get-next-item-ultimate</span> active
          </span>
        </div>
      </div>
    </div>
  );
}