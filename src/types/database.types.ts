export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_campaign: {
        Row: {
          created_at: string | null
          daily_cap: number | null
          daypart: Json | null
          end_at: string
          geo_scope: Database["public"]["Enums"]["geo_scope"] | null
          geo_targets: Json | null
          id: string
          lang: string | null
          name: string
          priority: number | null
          sov_pct: number | null
          start_at: string
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_cap?: number | null
          daypart?: Json | null
          end_at: string
          geo_scope?: Database["public"]["Enums"]["geo_scope"] | null
          geo_targets?: Json | null
          id?: string
          lang?: string | null
          name: string
          priority?: number | null
          sov_pct?: number | null
          start_at: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_cap?: number | null
          daypart?: Json | null
          end_at?: string
          geo_scope?: Database["public"]["Enums"]["geo_scope"] | null
          geo_targets?: Json | null
          id?: string
          lang?: string | null
          name?: string
          priority?: number | null
          sov_pct?: number | null
          start_at?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ad_creative: {
        Row: {
          active: boolean | null
          campaign_id: string
          created_at: string | null
          id: string
          lang: string
          link: string | null
          text_lines: Json
        }
        Insert: {
          active?: boolean | null
          campaign_id: string
          created_at?: string | null
          id?: string
          lang: string
          link?: string | null
          text_lines: Json
        }
        Update: {
          active?: boolean | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          lang?: string
          link?: string | null
          text_lines?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ad_creative_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item: {
        Row: {
          active: boolean | null
          created_at: string | null
          difficulty_or_depth: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id: string
          payload: Json
          similarity_group: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          difficulty_or_depth?: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id?: string
          payload: Json
          similarity_group?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          difficulty_or_depth?: string | null
          game_key?: Database["public"]["Enums"]["game_type"]
          id?: string
          payload?: Json
          similarity_group?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_pack: {
        Row: {
          created_at: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id: string
          name: string
          state: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id?: string
          name: string
          state?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_key?: Database["public"]["Enums"]["game_type"]
          id?: string
          name?: string
          state?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_flag: {
        Row: {
          audience: Json | null
          created_at: string | null
          key: string
          on_off_percent: number | null
          updated_at: string | null
        }
        Insert: {
          audience?: Json | null
          created_at?: string | null
          key: string
          on_off_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          audience?: Json | null
          created_at?: string | null
          key?: string
          on_off_percent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      game_config: {
        Row: {
          cooldowns: Json | null
          exploration_pct: number | null
          game_key: Database["public"]["Enums"]["game_type"]
          max_l4: number | null
          thresholds: Json
          updated_at: string | null
        }
        Insert: {
          cooldowns?: Json | null
          exploration_pct?: number | null
          game_key: Database["public"]["Enums"]["game_type"]
          max_l4?: number | null
          thresholds: Json
          updated_at?: string | null
        }
        Update: {
          cooldowns?: Json | null
          exploration_pct?: number | null
          game_key?: Database["public"]["Enums"]["game_type"]
          max_l4?: number | null
          thresholds?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      round: {
        Row: {
          decision: string | null
          ended_at: string | null
          id: string
          item_id: string
          meta: Json | null
          outcome: string | null
          session_id: string
          started_at: string | null
          t_round: number | null
          winners_json: Json | null
        }
        Insert: {
          decision?: string | null
          ended_at?: string | null
          id?: string
          item_id: string
          meta?: Json | null
          outcome?: string | null
          session_id: string
          started_at?: string | null
          t_round?: number | null
          winners_json?: Json | null
        }
        Update: {
          decision?: string | null
          ended_at?: string | null
          id?: string
          item_id?: string
          meta?: Json | null
          outcome?: string | null
          session_id?: string
          started_at?: string | null
          t_round?: number | null
          winners_json?: Json | null
        }
        Relationships: []
      }
      session: {
        Row: {
          device_id: string
          ended_at: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          device_id: string
          ended_at?: string | null
          game_key: Database["public"]["Enums"]["game_type"]
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          device_id?: string
          ended_at?: string | null
          game_key?: Database["public"]["Enums"]["game_type"]
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          city_id: number | null
          country_code: string | null
          created_at: string | null
          display_name: string | null
          geo_consent: boolean | null
          last_geo_at: string | null
          last_geohash5: string | null
          personalized_ads: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id?: number | null
          country_code?: string | null
          created_at?: string | null
          display_name?: string | null
          geo_consent?: boolean | null
          last_geo_at?: string | null
          last_geohash5?: string | null
          personalized_ads?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: number | null
          country_code?: string | null
          created_at?: string | null
          display_name?: string | null
          geo_consent?: boolean | null
          last_geo_at?: string | null
          last_geohash5?: string | null
          personalized_ads?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ad_performance: {
        Row: {
          avg_frequency: number | null
          campaign_id: string | null
          campaign_name: string | null
          cities_reached: number | null
          countries_served: Json | null
          date: string | null
          impressions: number | null
          unique_reach: number | null
        }
        Relationships: []
      }
      game_analytics: {
        Row: {
          avg_round_time: number | null
          date: string | null
          decision_distribution: Json | null
          depth_distribution: Json | null
          game_key: Database["public"]["Enums"]["game_type"] | null
          rounds_count: number | null
          sessions_count: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_email: string
          current_user_id: string
          current_user_role: string
          is_authenticated: boolean
          jwt_role: string
        }[]
      }
    }
    Enums: {
      campaign_status: "draft" | "scheduled" | "active" | "paused" | "completed"
      content_status:
        | "draft"
        | "in_review"
        | "approved"
        | "live"
        | "paused"
        | "archived"
      game_type: "who_among_us" | "agree_disagree" | "guess_the_person"
      geo_scope: "country" | "city" | "geofence"
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never