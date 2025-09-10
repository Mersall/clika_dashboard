import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRounds, useRoundStats } from '@hooks/useRounds';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ClockIcon, TrophyIcon, ChartBarIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function RoundAnalyticsPage() {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState('7days');
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const gameOptions = [
    { value: 'all', label: t('rounds.filters.allGames') },
    { value: 'who_among_us', label: t('content.games.who_among_us') },
    { value: 'agree_disagree', label: t('content.games.agree_disagree') },
    { value: 'guess_the_person', label: t('content.games.guess_the_person') },
  ];

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let from: Date;
    
    switch (timeFilter) {
      case '24hours':
        from = subDays(now, 1);
        break;
      case '7days':
        from = subDays(now, 7);
        break;
      case '30days':
        from = subDays(now, 30);
        break;
      case 'all':
        from = new Date('2020-01-01');
        break;
      default:
        from = subDays(now, 7);
    }
    
    return {
      from: startOfDay(from),
      to: endOfDay(now)
    };
  }, [timeFilter]);

  // Fetch data
  const filters = {
    gameKey: selectedGame === 'all' ? undefined : selectedGame,
    dateFrom: dateRange.from,
    dateTo: dateRange.to
  };

  const { data: rounds, isLoading: roundsLoading } = useRounds(filters);
  const { data: stats, isLoading: statsLoading } = useRoundStats(filters);

  // Format time duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Prepare chart data
  const timeDistributionData = useMemo(() => {
    if (!stats?.timeDistribution) return null;
    
    return {
      labels: stats.timeDistribution.map(d => d.range),
      datasets: [{
        label: t('rounds.charts.roundDuration'),
        data: stats.timeDistribution.map(d => d.count),
        backgroundColor: '#8dc63f',
        borderColor: '#7ab635',
        borderWidth: 1,
      }],
    };
  }, [stats, t]);

  const decisionBreakdownData = useMemo(() => {
    if (!stats?.decisionBreakdown || Object.keys(stats.decisionBreakdown).length === 0) return null;
    
    const colors = ['#8dc63f', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f4a261'];
    
    return {
      labels: Object.keys(stats.decisionBreakdown).map(key => 
        t(`rounds.decisions.${key}`, { defaultValue: key })
      ),
      datasets: [{
        data: Object.values(stats.decisionBreakdown),
        backgroundColor: colors,
        borderColor: colors.map(c => c + 'dd'),
        borderWidth: 2,
      }],
    };
  }, [stats, t]);

  const gameBreakdownData = useMemo(() => {
    if (!stats?.gameBreakdown || Object.keys(stats.gameBreakdown).length === 0) return null;
    
    return {
      labels: Object.keys(stats.gameBreakdown).map(key => {
        const game = gameOptions.find(g => g.value === key);
        return game?.label || key;
      }),
      datasets: [{
        label: t('rounds.charts.roundsByGame'),
        data: Object.values(stats.gameBreakdown),
        backgroundColor: ['#8dc63f', '#ff6b6b', '#4ecdc4'],
        borderColor: ['#7ab635', '#ff5252', '#45b7aa'],
        borderWidth: 1,
      }],
    };
  }, [stats, gameOptions, t]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('rounds.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('rounds.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="input select w-full sm:w-48"
        >
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
        
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="input select w-full sm:w-48"
        >
          <option value="24hours">{t('rounds.filters.last24Hours')}</option>
          <option value="7days">{t('rounds.filters.last7Days')}</option>
          <option value="30days">{t('rounds.filters.last30Days')}</option>
          <option value="all">{t('rounds.filters.allTime')}</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('rounds.stats.totalRounds')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalRounds.toLocaleString() || '0'}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('rounds.stats.uniqueSessions')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.uniqueSessions || '0'}
              </p>
            </div>
            <CursorArrowRaysIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('rounds.stats.avgDuration')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats ? formatDuration(stats.avgRoundTime) : '0s'}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('rounds.stats.completionRate')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats && stats.totalRounds > 0 
                  ? `${Math.round(((stats.totalRounds - (stats.decisionBreakdown['skip'] || 0)) / stats.totalRounds) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Distribution Chart */}
        {timeDistributionData && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {t('rounds.charts.timeDistribution')}
            </h3>
            <div className="h-[300px]">
              <Bar 
                data={timeDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)',
                      },
                      ticks: {
                        color: '#9CA3AF',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#9CA3AF',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Decision Breakdown Chart */}
        {decisionBreakdownData && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {t('rounds.charts.decisionBreakdown')}
            </h3>
            <div className="h-[300px]">
              <Doughnut 
                data={decisionBreakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#9CA3AF',
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Game Distribution */}
      {gameBreakdownData && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('rounds.charts.gameDistribution')}
          </h3>
          <div className="h-[250px]">
            <Bar 
              data={gameBreakdownData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Rounds Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('rounds.recentRounds')}
          </h3>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>{t('rounds.tableHeaders.roundId')}</th>
              <th>{t('rounds.tableHeaders.game')}</th>
              <th>{t('rounds.tableHeaders.duration')}</th>
              <th>{t('rounds.tableHeaders.decision')}</th>
              <th>{t('rounds.tableHeaders.time')}</th>
            </tr>
          </thead>
          <tbody>
            {roundsLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : rounds && rounds.length > 0 ? (
              rounds.slice(0, 10).map((round) => (
                <tr key={round.id}>
                  <td className="font-mono text-xs">
                    {round.id.slice(0, 8)}...
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {gameOptions.find(g => g.value === round.session?.game_key)?.label || round.session?.game_key}
                    </span>
                  </td>
                  <td>{round.t_round ? formatDuration(round.t_round) : '-'}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      round.decision === 'skip' 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {round.decision ? t(`rounds.decisions.${round.decision}`, { defaultValue: round.decision }) : '-'}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">
                    {round.started_at ? format(new Date(round.started_at), 'MMM dd, HH:mm') : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('rounds.noRounds')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}