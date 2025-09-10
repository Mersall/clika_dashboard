import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDAU, useDAUStats } from '@hooks/useDAU';
import { format, subDays } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon } from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DAUWidgetProps {
  className?: string;
}

export function DAUWidget({ className = '' }: DAUWidgetProps) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(7);
  
  const { data: dauData, isLoading } = useDAU(timeRange);
  const { data: stats } = useDAUStats(timeRange);

  // Prepare chart data
  const chartData = {
    labels: dauData?.slice().reverse().map(d => format(new Date(d.date), 'MMM dd')) || [],
    datasets: [
      {
        label: t('analytics.dau.totalUsers'),
        data: dauData?.slice().reverse().map(d => d.dau) || [],
        borderColor: '#8dc63f',
        backgroundColor: '#8dc63f20',
        tension: 0.4,
        fill: true,
      },
      {
        label: t('analytics.dau.newUsers'),
        data: dauData?.slice().reverse().map(d => d.new_users) || [],
        borderColor: '#4ecdc4',
        backgroundColor: '#4ecdc420',
        tension: 0.4,
        fill: true,
      },
      {
        label: t('analytics.dau.returningUsers'),
        data: dauData?.slice().reverse().map(d => d.returning_users) || [],
        borderColor: '#ff6b6b',
        backgroundColor: '#ff6b6b20',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9CA3AF',
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
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
  };

  return (
    <div className={`card p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('analytics.dau.title')}
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input select text-sm px-3 py-1"
          >
            <option value={7}>{t('analytics.dau.last7Days')}</option>
            <option value={14}>{t('analytics.dau.last14Days')}</option>
            <option value={30}>{t('analytics.dau.last30Days')}</option>
          </select>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('analytics.dau.currentDAU')}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.currentDAU || 0}
              </p>
              {stats && stats.trend !== 0 && (
                <span className={`flex items-center text-sm font-medium ${
                  stats.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.trend > 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(stats.trend)}%
                </span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('analytics.dau.avgDAU')}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.avgDAU || 0}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('analytics.dau.newVsReturning')}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-primary">{stats?.totalNewUsers || 0}</span>
              {' / '}
              <span className="text-secondary">{stats?.totalReturningUsers || 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="inline-flex items-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">{t('common.loading')}</span>
          </div>
        </div>
      ) : dauData && dauData.length > 0 ? (
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <UsersIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('analytics.dau.noData')}</p>
          </div>
        </div>
      )}
    </div>
  );
}