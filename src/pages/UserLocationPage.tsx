import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserLocations, useLocationStats, getCountryName } from '@hooks/useUserLocation';
import { format } from 'date-fns';
import { MapPinIcon, GlobeAltIcon, ShieldCheckIcon, MegaphoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
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

export function UserLocationPage() {
  const { t } = useTranslation();
  const [showOnlyWithLocation, setShowOnlyWithLocation] = useState(false);
  
  const { data: users, isLoading: usersLoading } = useUserLocations();
  const { data: stats, isLoading: statsLoading } = useLocationStats();

  // Filter users based on location toggle
  const filteredUsers = showOnlyWithLocation 
    ? users?.filter(u => u.country_code || u.city_id || u.last_geohash5)
    : users;

  // Prepare consent trends chart data
  const consentTrendsData = {
    labels: stats?.consentTrends.map(t => format(new Date(t.date), 'MMM dd')) || [],
    datasets: [
      {
        label: t('userLocation.charts.geoConsent'),
        data: stats?.consentTrends.map(t => t.geoConsent) || [],
        borderColor: '#8dc63f',
        backgroundColor: '#8dc63f20',
        tension: 0.4,
      },
      {
        label: t('userLocation.charts.adsConsent'),
        data: stats?.consentTrends.map(t => t.adsConsent) || [],
        borderColor: '#ff6b6b',
        backgroundColor: '#ff6b6b20',
        tension: 0.4,
      },
    ],
  };

  // Prepare country distribution chart data
  const countryData = stats?.countryDistribution && Object.keys(stats.countryDistribution).length > 0 ? {
    labels: Object.keys(stats.countryDistribution).map(code => getCountryName(code)),
    datasets: [{
      data: Object.values(stats.countryDistribution),
      backgroundColor: ['#8dc63f', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f4a261', '#e76f51'],
      borderColor: ['#7ab635', '#ff5252', '#45b7aa', '#3ca4c4', '#f39c51', '#d65d41'],
      borderWidth: 2,
    }],
  } : null;

  const getConsentPercentage = (consentCount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((consentCount / total) * 100);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('userLocation.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('userLocation.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('userLocation.stats.totalUsers')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('userLocation.stats.withLocation')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.usersWithLocation || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stats && stats.totalUsers > 0 
                  ? `${getConsentPercentage(stats.usersWithLocation, stats.totalUsers)}% ${t('userLocation.stats.ofTotal')}`
                  : '0%'
                }
              </p>
            </div>
            <MapPinIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('userLocation.stats.geoConsent')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.geoConsentGiven || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stats && stats.totalUsers > 0 
                  ? `${getConsentPercentage(stats.geoConsentGiven, stats.totalUsers)}% ${t('userLocation.stats.consented')}`
                  : '0%'
                }
              </p>
            </div>
            <ShieldCheckIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('userLocation.stats.adsConsent')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.adsConsentGiven || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stats && stats.totalUsers > 0 
                  ? `${getConsentPercentage(stats.adsConsentGiven, stats.totalUsers)}% ${t('userLocation.stats.consented')}`
                  : '0%'
                }
              </p>
            </div>
            <MegaphoneIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Consent Trends Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('userLocation.charts.consentTrends')}
          </h3>
          {stats?.consentTrends && stats.consentTrends.length > 0 ? (
            <div className="h-[300px]">
              <Line 
                data={consentTrendsData}
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('userLocation.noData')}
            </div>
          )}
        </div>

        {/* Country Distribution Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('userLocation.charts.countryDistribution')}
          </h3>
          {countryData ? (
            <div className="h-[300px]">
              <Doughnut 
                data={countryData}
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
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <GlobeAltIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('userLocation.noLocationData')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('userLocation.usersList')}
          </h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOnlyWithLocation}
              onChange={(e) => setShowOnlyWithLocation(e.target.checked)}
              className="rounded border-gray-400 dark:border-gray-600 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {t('userLocation.showOnlyWithLocation')}
            </span>
          </label>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>{t('userLocation.tableHeaders.user')}</th>
              <th>{t('userLocation.tableHeaders.country')}</th>
              <th>{t('userLocation.tableHeaders.lastLocation')}</th>
              <th>{t('userLocation.tableHeaders.geoConsent')}</th>
              <th>{t('userLocation.tableHeaders.adsConsent')}</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {user.display_name || t('users.unknownUser')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.country_code ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        <GlobeAltIcon className="h-3 w-3 mr-1" />
                        {getCountryName(user.country_code)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">
                    {user.last_geo_at 
                      ? format(new Date(user.last_geo_at), 'MMM dd, yyyy HH:mm')
                      : '-'
                    }
                  </td>
                  <td>
                    {user.geo_consent !== null ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.geo_consent 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {user.geo_consent ? t('common.yes') : t('common.no')}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                  <td>
                    {user.personalized_ads !== null ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.personalized_ads 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {user.personalized_ads ? t('common.yes') : t('common.no')}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {showOnlyWithLocation ? t('userLocation.noUsersWithLocation') : t('userLocation.noUsers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}