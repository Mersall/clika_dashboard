import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

export interface GameConfig {
  game_key: string;
  exploration_pct: number;
  max_l4: number | null;
  cooldown_hours: number | null;
  enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
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
      return data as GameConfig[];
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
          cooldown_hours: config.cooldown_hours,
          enabled: config.enabled,
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
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as SystemConfig[];
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