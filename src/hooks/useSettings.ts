import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

export interface GameConfig {
  game_key: string;
  exploration_pct: number;
  max_l4: number | null;
  thresholds: any;
  cooldowns: any;
  updated_at: string | null;
  enabled?: boolean; // Client-side only, derived from thresholds
}

export interface FeatureFlag {
  key: string;
  on_off_percent: number;
  audience: any;
  enabled?: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SystemConfig {
  key: string;
  value: any;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Game Configs
export function useGameConfigs() {
  return useQuery({
    queryKey: ['game-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_config')
        .select('*')
        .order('game_key');

      if (error) throw error;

      // Map the data and add client-side enabled flag
      return (data || []).map(config => ({
        ...config,
        exploration_pct: Number(config.exploration_pct) || 0.1,
        enabled: true // Default to enabled since there's no enabled column
      })) as GameConfig[];
    },
  });
}

export function useUpdateGameConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: GameConfig) => {
      const { error } = await supabase
        .from('game_config')
        .update({
          exploration_pct: config.exploration_pct,
          max_l4: config.max_l4,
          thresholds: config.thresholds,
          cooldowns: config.cooldowns,
          updated_at: new Date().toISOString(),
        })
        .eq('game_key', config.game_key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-configs'] });
      toast.success('Game configuration updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update configuration');
    },
  });
}

// Feature Flags
export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flag')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching feature flags:', error);
        // Return empty array if RLS policies prevent access or table doesn't exist
        // This prevents the page from getting stuck in loading state
        return [] as FeatureFlag[];
      }
      return data as FeatureFlag[];
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (flag: FeatureFlag) => {
      const { error } = await supabase
        .from('feature_flag')
        .update({
          on_off_percent: flag.on_off_percent,
          audience: flag.audience,
          enabled: flag.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('key', flag.key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update feature flag');
    },
  });
}

// System Configs
export function useSystemConfigs() {
  return useQuery({
    queryKey: ['system-configs'],
    queryFn: async () => {
      // System config table doesn't exist yet, return empty array
      // This prevents errors while the feature is not implemented
      return [] as SystemConfig[];
    },
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: SystemConfig) => {
      const { error } = await supabase
        .from('system_config')
        .update({
          value: config.value,
          description: config.description,
          updated_at: new Date().toISOString(),
        })
        .eq('key', config.key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      toast.success('System configuration updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update configuration');
    },
  });
}