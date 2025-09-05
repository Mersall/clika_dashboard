import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { Database } from '@services/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type AdCampaign = Database['public']['Tables']['ad_campaign']['Row'];

export function CampaignsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaign')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdCampaign[];
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'paused':
        return 'badge-warning';
      case 'ended':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Ad Campaigns</h1>
          <p className="mt-2 text-gray-400">Manage advertising campaigns and creatives</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Daily Cap</th>
              <th>SOV %</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : campaigns?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No campaigns found
                </td>
              </tr>
            ) : (
              campaigns?.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="font-medium">{campaign.name}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td>{campaign.priority}</td>
                  <td>{campaign.daily_cap || '∞'}</td>
                  <td>{campaign.sov_pct ? `${campaign.sov_pct}%` : '-'}</td>
                  <td>{new Date(campaign.start_at).toLocaleDateString()}</td>
                  <td>{new Date(campaign.end_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-primary-500">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}