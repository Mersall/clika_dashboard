import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { useTranslation } from 'react-i18next';
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  MegaphoneIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { HelpTooltip } from '@components/ui/HelpTooltip';

interface Stat {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

export function HomePage() {
  const { t } = useTranslation();
  
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Fetch various stats with proper error handling
      // Use separate queries to handle RLS policies better

      // Get user count
      const { data: users, error: userError } = await supabase
        .from('user_profile')
        .select('user_id');
      if (userError) console.error('User count error:', userError);
      const totalUsers = users?.length || 0;

      // Get today's sessions
      const { data: todaySessions, error: sessionError } = await supabase
        .from('session')
        .select('id')
        .gte('started_at', today + 'T00:00:00');
      if (sessionError) console.error('Session count error:', sessionError);
      const totalSessions = todaySessions?.length || 0;

      // Get active content
      const { data: activeContent, error: contentError } = await supabase
        .from('content_item')
        .select('id')
        .eq('active', true);
      if (contentError) console.error('Content count error:', contentError);
      const totalContent = activeContent?.length || 0;

      // Get active campaigns - this might fail if table doesn't exist
      let activeCampaigns = 0;
      try {
        const { data: campaigns, error: campaignError } = await supabase
          .from('ad_campaign')
          .select('id')
          .eq('status', 'active');
        if (!campaignError && campaigns) {
          activeCampaigns = campaigns.length;
        }
      } catch {
        // Table might not exist, ignore
      }

      return {
        totalUsers,
        totalSessions,
        totalContent,
        activeCampaigns,
      };
    },
  });

  // Fetch recent sessions
  const { data: recentSessions } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session')
        .select(`
          id,
          started_at,
          ended_at,
          game_key,
          user_id
        `)
        .order('started_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Recent sessions error:', error);
        return [];
      }
      
      return data || [];
    },
  });

  // Fetch top content
  const { data: topContent } = useQuery({
    queryKey: ['top-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_item')
        .select('id, game_key, payload, status')
        .eq('active', true)
        .limit(5);
      
      if (error) {
        console.error('Top content error:', error);
        return [];
      }
      
      return data || [];
    },
  });

  const statCards: Stat[] = [
    {
      name: t('dashboard.stats.totalUsers'),
      value: stats?.totalUsers.toLocaleString() || '0',
      change: '+12%',
      trend: 'up',
      icon: UsersIcon,
    },
    {
      name: t('dashboard.stats.sessionsToday'),
      value: stats?.totalSessions.toLocaleString() || '0',
      change: '+5%',
      trend: 'up',
      icon: ChartBarIcon,
    },
    {
      name: t('dashboard.stats.activeContent'),
      value: stats?.totalContent.toLocaleString() || '0',
      change: '+23',
      trend: 'up',
      icon: DocumentTextIcon,
    },
    {
      name: t('dashboard.stats.activeCampaigns'),
      value: stats?.activeCampaigns.toString() || '0',
      change: '-2',
      trend: 'down',
      icon: MegaphoneIcon,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-4 sm:p-6">
            <div className="flex items-start sm:items-center">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gray-800 flex-shrink-0">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.name}</p>
                  <HelpTooltip helpKey={`dashboard.stats.${stat.name === t('dashboard.stats.totalUsers') ? 'totalUsers' : stat.name === t('dashboard.stats.sessionsToday') ? 'sessionsToday' : stat.name === t('dashboard.stats.activeContent') ? 'activeContent' : 'activeCampaigns'}`} />
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
              <span
                className={`flex items-center font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                )}
                {stat.change}
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-500 truncate">{t('dashboard.fromYesterday')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recentSessions')}</h2>
            <HelpTooltip helpKey="dashboard.recentSessions" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentSessions && recentSessions.length > 0 ? (
              <div className="space-y-2">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-gray-100">
                        User {session.user_id.slice(0, 8)}
                      </span>
                      <span className="text-gray-500">
                        {new Date(session.started_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {session.game_key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.sessionActivity')}</p>
            )}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.topContent')}</h2>
            <HelpTooltip helpKey="dashboard.topContent" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {topContent && topContent.length > 0 ? (
              <div className="space-y-2">
                {topContent.map((content: any) => (
                  <div key={content.id} className="text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-gray-100 truncate pr-2">
                        {content.payload?.question ||
                         content.payload?.statement ||
                         content.payload?.persona?.name ||
                         content.payload?.persona?.name_en ||
                         content.payload?.person_name ||
                         'No content'}
                      </span>
                      <span className="text-gray-500 flex-shrink-0">
                        {content.game_key.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.popularContent')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}