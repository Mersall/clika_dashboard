import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  DeviceTabletIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  useDeviceAnalytics, 
  useUserDevices, 
  useDeviceSessions,
  useDeviceRetention 
} from '../hooks/useDeviceAnalytics';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';

export function SessionDeviceAnalyticsPage() {
  const { t } = useTranslation();
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7days');
  
  const { data: analytics, isLoading: analyticsLoading } = useDeviceAnalytics();
  const { data: userDevices, isLoading: devicesLoading } = useUserDevices();
  const { data: deviceSessions, isLoading: sessionsLoading } = useDeviceSessions();
  const { data: retention } = useDeviceRetention(selectedDeviceType === 'all' ? undefined : selectedDeviceType);
  
  const isLoading = analyticsLoading || devicesLoading || sessionsLoading;
  
  // Device type distribution chart
  const deviceTypeChart = {
    labels: Object.keys(analytics?.deviceTypes || {}),
    datasets: [{
      data: Object.values(analytics?.deviceTypes || {}),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', // iOS blue
        'rgba(34, 197, 94, 0.8)',  // Android green
        'rgba(168, 85, 247, 0.8)'   // Web purple
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 1
    }]
  };
  
  const deviceTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(229, 231, 235)'
        }
      },
      title: {
        display: false
      }
    }
  };
  
  // Sessions per device chart
  const sessionsPerDeviceChart = {
    labels: deviceSessions?.map(d => d.device_id.slice(-4)) || [],
    datasets: [{
      label: 'Sessions',
      data: deviceSessions?.map(d => d.session_count) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };
  
  const sessionsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        }
      }
    }
  };
  
  // Device retention chart
  const retentionChart = {
    labels: ['Day 1', 'Day 7', 'Day 30'],
    datasets: [{
      label: 'Retention %',
      data: [retention?.day1 || 0, retention?.day7 || 0, retention?.day30 || 0],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.3,
      fill: true
    }]
  };
  
  const retentionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: (value: any) => `${value}%`
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        }
      }
    }
  };
  
  const getDeviceIcon = (deviceId: string) => {
    if (deviceId.includes('ios')) {
      return <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />;
    } else if (deviceId.includes('android')) {
      return <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />;
    } else if (deviceId.includes('web')) {
      return <ComputerDesktopIcon className="h-5 w-5 text-purple-500" />;
    }
    return <DeviceTabletIcon className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Session Device Analytics</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">
            Track device usage patterns and cross-device behavior
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '7days'
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '30days'
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange('90days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '90days'
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last 90 days
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Unique Devices</h3>
              <p className="mt-2 text-2xl font-bold text-gray-100">
                {analytics?.uniqueDevices.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total tracked</p>
            </div>
            <DevicePhoneMobileIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Sessions per Device</h3>
              <p className="mt-2 text-2xl font-bold text-gray-100">
                {analytics?.sessionsPerDevice.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Average</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Cross-Device Users</h3>
              <p className="mt-2 text-2xl font-bold text-gray-100">
                {analytics?.crossDeviceUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {((analytics?.crossDeviceUsers || 0) / (analytics?.uniqueDevices || 1) * 100).toFixed(1)}% of users
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">7-Day Retention</h3>
              <p className="mt-2 text-2xl font-bold text-gray-100">
                {analytics?.deviceRetention.day7}%
              </p>
              <p className="text-sm text-green-500 mt-1">+5.2% vs last period</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Device Type Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Device Type Distribution</h3>
          <div className="h-[250px]">
            {!isLoading && <Doughnut data={deviceTypeChart} options={deviceTypeOptions} />}
          </div>
        </div>
        
        {/* Sessions per Device */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Devices by Sessions</h3>
          <div className="h-[250px]">
            {!isLoading && <Bar data={sessionsPerDeviceChart} options={sessionsChartOptions} />}
          </div>
        </div>
        
        {/* Device Retention */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Device Retention
            {selectedDeviceType !== 'all' && ` - ${selectedDeviceType}`}
          </h3>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedDeviceType('all')}
              className={`px-3 py-1 rounded text-sm ${
                selectedDeviceType === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDeviceType('iOS')}
              className={`px-3 py-1 rounded text-sm ${
                selectedDeviceType === 'iOS'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setSelectedDeviceType('Android')}
              className={`px-3 py-1 rounded text-sm ${
                selectedDeviceType === 'Android'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Android
            </button>
          </div>
          <div className="h-[200px]">
            {!isLoading && <Line data={retentionChart} options={retentionOptions} />}
          </div>
        </div>
      </div>
      
      {/* User Devices Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-gray-100">User Device Details</h3>
          <p className="text-sm text-gray-400 mt-1">Users with multiple devices and their activity</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Device</th>
                <th>Device Count</th>
                <th>Total Sessions</th>
                <th>First Seen</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="inline-flex items-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      <span className="ml-2">Loading device data...</span>
                    </div>
                  </td>
                </tr>
              ) : userDevices?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No device data available
                  </td>
                </tr>
              ) : (
                userDevices?.map((device) => (
                  <tr key={`${device.user_id}-${device.device_id}`}>
                    <td>
                      <div className="font-medium text-gray-100">{device.user_id}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_id)}
                        <span className="text-sm text-gray-400">{device.device_id}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        device.device_count > 2 
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {device.device_count} devices
                      </span>
                    </td>
                    <td className="text-sm text-gray-300">{device.total_sessions}</td>
                    <td className="text-sm text-gray-400">
                      {format(new Date(device.first_seen), 'MMM dd, yyyy')}
                    </td>
                    <td className="text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {format(new Date(device.last_seen), 'MMM dd, HH:mm')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mt-6 card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Device Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">iOS devices show 10% higher retention rates</p>
              <p className="text-sm text-gray-500 mt-1">
                Consider optimizing Android app experience to match iOS performance
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">20% of users access from multiple devices</p>
              <p className="text-sm text-gray-500 mt-1">
                Ensure seamless cross-device experience and sync
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">Web users have shorter session durations</p>
              <p className="text-sm text-gray-500 mt-1">
                Web experience may need optimization for engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}