import { useState } from 'react';
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
import { Line, Doughnut } from 'react-chartjs-2';
import { useSessionStats, useGameStats, useContentStats, useAdDeliveryStats } from '../hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import { DAUWidget } from '../components/analytics/DAUWidget';
import { HelpTooltip } from '../components/ui/HelpTooltip';

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

export function AnalyticsPage() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('7d');

  // Fetch analytics data using our custom hooks
  const { data: sessionStats, isLoading: sessionsLoading } = useSessionStats();
  const { data: gameStats, isLoading: gamesLoading } = useGameStats();
  const { data: contentStats, isLoading: contentLoading } = useContentStats();
  const { data: adStats, isLoading: adLoading } = useAdDeliveryStats();

  const isLoading = sessionsLoading || gamesLoading || contentLoading || adLoading;

  // Prepare chart data for game distribution
  const gameDistributionData = {
    labels: gameStats?.map(game => {
      switch (game.game_type) {
        case 'who_among_us': return t('content.games.who_among_us');
        case 'agree_disagree': return t('content.games.agree_disagree');
        case 'guess_the_person': return t('content.games.guess_the_person');
        default: return game.game_type;
      }
    }) || [],
    datasets: [
      {
        data: gameStats?.map(game => game.total_rounds) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Generate mock time series data for sessions (replace with real data later)
  const generateTimeSeriesData = (days: number) => {
    const labels = [];
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
      data.push(Math.floor(Math.random() * 500) + 200);
    }
    
    return { labels, data };
  };

  const timeSeriesData = generateTimeSeriesData(7);
  const sessionsChartData = {
    labels: timeSeriesData.labels,
    datasets: [
      {
        label: t('analytics.charts.sessions'),
        data: timeSeriesData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="inline-flex items-center">
            <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
            <span className="ml-2 text-sm sm:text-base">{t('analytics.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{t('analytics.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">{t('analytics.subtitle')}</p>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="24h">{t('analytics.filters.last24Hours')}</option>
          <option value="7d">{t('analytics.filters.last7Days')}</option>
          <option value="30d">{t('analytics.filters.last30Days')}</option>
          <option value="90d">{t('analytics.filters.last90Days')}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 sm:mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400">{t('analytics.stats.activeUsers')}</h3>
            <HelpTooltip helpKey="analytics.stats.activeUsers" />
          </div>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-100">
            {sessionStats?.active_users?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400">{t('analytics.stats.totalRounds')}</h3>
            <HelpTooltip helpKey="analytics.stats.totalRounds" />
          </div>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-100">
            {sessionStats?.total_rounds?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400">{t('analytics.stats.avgSessionTime')}</h3>
            <HelpTooltip helpKey="analytics.stats.avgSessionTime" />
          </div>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-100">
            {sessionStats?.average_duration_seconds 
              ? `${Math.round(sessionStats.average_duration_seconds / 60)} ${t('analytics.minutes')}` 
              : `0 ${t('analytics.minutes')}`}
          </p>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400">{t('analytics.stats.totalContent')}</h3>
            <HelpTooltip helpKey="analytics.stats.totalContent" />
          </div>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-100">
            {contentStats?.total_content?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* DAU Widget */}
      <div className="mb-6">
        <DAUWidget />
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-100">{t('analytics.charts.sessionsOverTime')}</h2>
            <HelpTooltip helpKey="analytics.charts.sessionsOverTime" />
          </div>
          <div className="h-48 sm:h-64">
            <Line 
              data={sessionsChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { 
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: { size: 10 }
                    },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { 
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: { size: 10 },
                      maxRotation: 45,
                      minRotation: 45
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-100">{t('analytics.charts.gameDistribution')}</h2>
            <HelpTooltip helpKey="analytics.charts.gameDistribution" />
          </div>
          <div className="h-48 sm:h-64">
            {gameStats && gameStats.length > 0 ? (
              <Doughnut 
                data={gameDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { size: 11 },
                        padding: 10
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                {t('analytics.charts.noData')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-100">{t('analytics.charts.contentByStatus')}</h2>
          <div className="space-y-2">
            {contentStats?.by_status && Object.entries(contentStats.by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-400 capitalize">{status || t('analytics.unknown')}</span>
                <span className="text-sm sm:text-base text-gray-100">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-100">{t('analytics.charts.gamePerformance')}</h2>
          <div className="space-y-2">
            {gameStats?.map(game => (
              <div key={game.game_type} className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-400">
                  {game.game_type === 'who_among_us' ? t('content.games.who_among_us') :
                   game.game_type === 'agree_disagree' ? t('content.games.agree_disagree') :
                   game.game_type === 'guess_the_person' ? t('content.games.guess_the_person') :
                   game.game_type}
                </span>
                <div className="text-right">
                  <span className="text-sm sm:text-base text-gray-100">{game.total_rounds} {t('analytics.rounds')}</span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">
                    (~{Math.round(game.average_duration)}s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Delivery Stats */}
      <div className="mt-4 sm:mt-6">
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-100">{t('analytics.adDelivery.title')}</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="card p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-1">
                <div className="text-xs sm:text-sm text-gray-400">{t('analytics.adDelivery.totalImpressions')}</div>
                <HelpTooltip helpKey="analytics.adDelivery.totalImpressions" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-100 mt-1">{adStats?.totalImpressions || 0}</div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-1">
                <div className="text-xs sm:text-sm text-gray-400">{t('analytics.adDelivery.uniqueUsers')}</div>
                <HelpTooltip helpKey="analytics.adDelivery.uniqueUsers" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-100 mt-1">{adStats?.uniqueUsers || 0}</div>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div>
              <div className="flex items-center gap-1">
                <div className="text-xs sm:text-sm text-gray-400">{t('analytics.adDelivery.activeCampaigns')}</div>
                <HelpTooltip helpKey="analytics.adDelivery.activeCampaigns" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-100 mt-1">{adStats?.campaignStats ? Object.keys(adStats.campaignStats).length : 0}</div>
            </div>
          </div>
        </div>
        
        {adStats?.campaignStats && Object.keys(adStats.campaignStats).length > 0 && (
          <div className="card p-4 sm:p-6 mt-4">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-100">{t('analytics.adDelivery.campaignPerformance')}</h3>
            <div className="space-y-2">
              {Object.entries(adStats.campaignStats).map(([campaign, impressions]) => (
                <div key={campaign} className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-400 truncate mr-2">{campaign}</span>
                  <span className="text-sm sm:text-base text-gray-100 whitespace-nowrap">{impressions} {t('analytics.adDelivery.impressions')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}