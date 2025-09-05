import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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
  const [dateRange, setDateRange] = useState('7d');

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      // Mock data for now - would connect to actual analytics views
      return {
        sessions: generateTimeSeriesData(7),
        gameDistribution: {
          'Who Among Us': 45,
          'Agree/Disagree': 30,
          'Guess the Person': 25,
        },
        avgSessionTime: 12.5,
        totalRounds: 15432,
        activeUsers: 1234,
      };
    },
  });

  const sessionsChartData = {
    labels: analytics?.sessions.labels || [],
    datasets: [
      {
        label: 'Sessions',
        data: analytics?.sessions.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const gameDistributionData = {
    labels: Object.keys(analytics?.gameDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics?.gameDistribution || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
          <p className="mt-2 text-gray-400">Game performance and user insights</p>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input w-40"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-100">
            {analytics?.activeUsers.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Total Rounds</h3>
          <p className="mt-2 text-3xl font-bold text-gray-100">
            {analytics?.totalRounds.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Avg Session Time</h3>
          <p className="mt-2 text-3xl font-bold text-gray-100">
            {analytics?.avgSessionTime.toFixed(1)} min
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-100">82%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-100">Sessions Over Time</h2>
          <div className="h-64">
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
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-100">Game Distribution</h2>
          <div className="h-64">
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
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function generateTimeSeriesData(days: number) {
  const labels = [];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
    data.push(Math.floor(Math.random() * 500) + 200);
  }
  
  return { labels, data };
}