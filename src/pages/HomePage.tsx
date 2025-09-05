import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  MegaphoneIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

interface Stat {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

export function HomePage() {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Fetch various stats
      const [
        { count: totalUsers },
        { count: totalSessions },
        { count: totalContent },
        { count: activeCampaigns }
      ] = await Promise.all([
        supabase.from('user_profile').select('*', { count: 'exact', head: true }),
        supabase.from('session').select('*', { count: 'exact', head: true }).gte('started_at', today),
        supabase.from('content_item').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('ad_campaign').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalSessions: totalSessions || 0,
        totalContent: totalContent || 0,
        activeCampaigns: activeCampaigns || 0,
      };
    },
  });

  const statCards: Stat[] = [
    {
      name: 'Total Users',
      value: stats?.totalUsers.toLocaleString() || '0',
      change: '+12%',
      trend: 'up',
      icon: UsersIcon,
    },
    {
      name: 'Sessions Today',
      value: stats?.totalSessions.toLocaleString() || '0',
      change: '+5%',
      trend: 'up',
      icon: ChartBarIcon,
    },
    {
      name: 'Active Content',
      value: stats?.totalContent.toLocaleString() || '0',
      change: '+23',
      trend: 'up',
      icon: DocumentTextIcon,
    },
    {
      name: 'Active Campaigns',
      value: stats?.activeCampaigns.toString() || '0',
      change: '-2',
      trend: 'down',
      icon: MegaphoneIcon,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="mt-2 text-gray-400">Welcome to CLIKA Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                <stat.icon className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-100">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span
                className={`flex items-center font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                )}
                {stat.change}
              </span>
              <span className="ml-2 text-gray-500">from yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-100">Recent Sessions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Session activity will appear here</p>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-100">Top Content</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Popular content will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}