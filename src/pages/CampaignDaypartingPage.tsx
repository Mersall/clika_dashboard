import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaigns';
import { DaypartingHeatmap } from '../components/campaigns/DaypartingHeatmap';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

// Mock data for demonstration
const generateMockHeatmapData = () => {
  const data: Record<string, Record<number, number>> = {};
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  days.forEach(day => {
    data[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      // Generate realistic patterns
      let base = 100;
      
      // Weekday vs Weekend
      if (['sat', 'sun'].includes(day)) {
        base = 150;
      }
      
      // Time of day patterns
      if (hour >= 9 && hour <= 11) base *= 2.5; // Morning peak
      if (hour >= 12 && hour <= 13) base *= 2; // Lunch time
      if (hour >= 18 && hour <= 21) base *= 3; // Evening peak
      if (hour >= 0 && hour <= 6) base *= 0.2; // Night time low
      
      // Add some randomness
      const variance = (Math.random() - 0.5) * base * 0.4;
      data[day][hour] = Math.round(base + variance);
    }
  });
  
  return data;
};

export function CampaignDaypartingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: campaign, isLoading, error } = useCampaign(id || '');
  
  // Mock data for different metrics
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'clicks' | 'conversions'>('impressions');
  
  const metricsData = {
    impressions: generateMockHeatmapData(),
    clicks: generateMockHeatmapData(),
    conversions: generateMockHeatmapData(),
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading campaign data...</p>
        </div>
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load campaign</p>
          <button onClick={() => navigate('/campaigns')} className="btn btn-primary">
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-400 hover:text-gray-100 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Campaigns
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
              Dayparting Analysis: {campaign.name}
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">
              Analyze hourly performance patterns across different days
            </p>
          </div>
          
          {/* Metric Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('impressions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'impressions'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Impressions
            </button>
            <button
              onClick={() => setSelectedMetric('clicks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'clicks'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Clicks
            </button>
            <button
              onClick={() => setSelectedMetric('conversions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'conversions'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Conversions
            </button>
          </div>
        </div>
      </div>
      
      {/* Current Dayparting Settings */}
      {campaign.daypart && (campaign.daypart.days?.length > 0 || campaign.daypart.hours?.length > 0) && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Current Dayparting Schedule</h3>
          <div className="space-y-3">
            {campaign.daypart.days?.length > 0 && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Days:</span>
                <div className="flex gap-2 mt-1">
                  {campaign.daypart.days.map((day: string) => (
                    <span key={day} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {campaign.daypart.hours?.length > 0 && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Hours:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.daypart.hours.map((hour: number) => (
                    <span key={hour} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Heatmap */}
      <DaypartingHeatmap 
        data={metricsData[selectedMetric]}
        title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} by Hour and Day`}
        valueLabel={selectedMetric}
      />
      
      {/* Summary Stats */}
      <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Best Performing Hour</h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">6:00 PM</p>
          <p className="text-sm text-gray-500 mt-1">+45% above average</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Best Performing Day</h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">Friday</p>
          <p className="text-sm text-gray-500 mt-1">+32% above average</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Weakest Period</h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">2-6 AM</p>
          <p className="text-sm text-gray-500 mt-1">-78% below average</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Weekend vs Weekday</h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">+25%</p>
          <p className="text-sm text-gray-500 mt-1">Weekend performance</p>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="mt-6 card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">Consider increasing budget allocation during 6-9 PM on weekdays</p>
              <p className="text-sm text-gray-500 mt-1">These hours show 45% higher engagement rates</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">Pause campaigns during 2-6 AM to optimize budget efficiency</p>
              <p className="text-sm text-gray-500 mt-1">Very low activity during these hours across all days</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">Weekend afternoons show strong performance potential</p>
              <p className="text-sm text-gray-500 mt-1">Consider creating weekend-specific campaigns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}