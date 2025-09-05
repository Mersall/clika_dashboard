import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profile: {
        Row: {
          user_id: string;
          display_name?: string;
          city_id?: number;
          country_code?: string;
          geo_consent: boolean;
          personalized_ads: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      content_item: {
        Row: {
          id: string;
          game_key: string;
          difficulty_or_depth: number;
          tags: string[];
          similarity_group?: string;
          active: boolean;
          payload: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['content_item']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['content_item']['Insert']>;
      };
      content_pack: {
        Row: {
          id: string;
          name: string;
          game_key: string;
          tags: string[];
          state: 'draft' | 'in_review' | 'approved' | 'live' | 'paused' | 'archived';
          created_at: string;
          updated_at: string;
        };
      };
      ad_campaign: {
        Row: {
          id: string;
          name: string;
          start_at: string;
          end_at: string;
          priority: number;
          daily_cap?: number;
          sov_pct?: number;
          geo_scope?: string;
          geo_targets?: any;
          daypart?: any;
          lang?: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ad_campaign']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ad_campaign']['Insert']>;
      };
      ad_creative: {
        Row: {
          id: string;
          campaign_id: string;
          text_lines: string[];
          link?: string;
          lang: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      session: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          game_key: string;
          started_at: string;
          ended_at?: string;
        };
      };
      round: {
        Row: {
          id: string;
          session_id: string;
          item_id: string;
          started_at: string;
          ended_at?: string;
          t_round?: number;
          decision?: string;
          outcome?: string;
        };
      };
      game_config: {
        Row: {
          game_key: string;
          thresholds: any;
          exploration_pct: number;
          cooldowns: any;
          max_l4?: number;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['game_config']['Row'];
        Update: Partial<Database['public']['Tables']['game_config']['Row']>;
      };
      feature_flag: {
        Row: {
          key: string;
          on_off_percent: number;
          audience?: string;
          updated_at: string;
        };
      };
    };
    Views: {
      game_analytics: {
        Row: {
          game_key: string;
          date: string;
          sessions_count: number;
          rounds_count: number;
          avg_round_time: number;
          unique_users: number;
        };
      };
      ad_performance: {
        Row: {
          campaign_id: string;
          date: string;
          impressions: number;
          unique_reach: number;
          avg_frequency: number;
        };
      };
    };
  };
};