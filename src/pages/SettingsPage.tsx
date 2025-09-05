import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { Database } from '@services/supabase';
import toast from 'react-hot-toast';

type GameConfig = Database['public']['Tables']['game_config']['Row'];
type FeatureFlag = Database['public']['Tables']['feature_flag']['Row'];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'game' | 'features'>('game');

  // Fetch game configs
  const { data: gameConfigs } = useQuery({
    queryKey: ['game-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_config')
        .select('*');
      
      if (error) throw error;
      return data as GameConfig[];
    },
  });

  // Fetch feature flags
  const { data: featureFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flag')
        .select('*');
      
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });

  // Update game config
  const updateConfigMutation = useMutation({
    mutationFn: async (config: GameConfig) => {
      const { error } = await supabase
        .from('game_config')
        .update(config)
        .eq('game_key', config.game_key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-configs'] });
      toast.success('Configuration updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update configuration');
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
        <p className="mt-2 text-gray-400">Configure game settings and feature flags</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('game')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'game'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-gray-400 hover:text-gray-100'
          }`}
        >
          Game Configuration
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`ml-8 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'features'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-gray-400 hover:text-gray-100'
          }`}
        >
          Feature Flags
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'game' && (
        <div className="space-y-6">
          {gameConfigs?.map((config) => (
            <div key={config.game_key} className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-100">
                {config.game_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label mb-2">Exploration Rate (%)</label>
                  <input
                    type="number"
                    value={config.exploration_pct * 100}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                        exploration_pct: Number(e.target.value) / 100,
                      };
                      updateConfigMutation.mutate(newConfig);
                    }}
                    className="input"
                    min="0"
                    max="100"
                  />
                </div>
                
                {config.max_l4 !== null && (
                  <div>
                    <label className="label mb-2">Max L4 per Cycle</label>
                    <input
                      type="number"
                      value={config.max_l4}
                      onChange={(e) => {
                        const newConfig = {
                          ...config,
                          max_l4: Number(e.target.value),
                        };
                        updateConfigMutation.mutate(newConfig);
                      }}
                      className="input"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-4">
          {featureFlags?.map((flag) => (
            <div key={flag.key} className="card flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-100">{flag.key}</h4>
                {flag.audience && (
                  <p className="text-sm text-gray-400">Audience: {flag.audience}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {flag.on_off_percent}% enabled
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={flag.on_off_percent}
                  onChange={(e) => {
                    // Would update flag here
                    console.log('Update flag:', flag.key, e.target.value);
                  }}
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}