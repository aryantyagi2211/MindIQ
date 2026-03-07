export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      battles: {
        Row: {
          created_at: string
          difficulty: string
          field: string
          id: string
          player1_answers: Json | null
          player1_id: string
          player1_score: number | null
          player2_answers: Json | null
          player2_id: string | null
          player2_score: number | null
          qualification: string
          questions: Json | null
          status: string
          subfield: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string
          field: string
          id?: string
          player1_answers?: Json | null
          player1_id: string
          player1_score?: number | null
          player2_answers?: Json | null
          player2_id?: string | null
          player2_score?: number | null
          qualification?: string
          questions?: Json | null
          status?: string
          subfield: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string
          field?: string
          id?: string
          player1_answers?: Json | null
          player1_id?: string
          player1_score?: number | null
          player2_answers?: Json | null
          player2_id?: string | null
          player2_score?: number | null
          qualification?: string
          questions?: Json | null
          status?: string
          subfield?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_code: string
          challenged_result_id: string | null
          challenged_user_id: string | null
          challenger_id: string
          challenger_result_id: string
          created_at: string
          id: string
        }
        Insert: {
          challenge_code?: string
          challenged_result_id?: string | null
          challenged_user_id?: string | null
          challenger_id: string
          challenger_result_id: string
          created_at?: string
          id?: string
        }
        Update: {
          challenge_code?: string
          challenged_result_id?: string | null
          challenged_user_id?: string | null
          challenger_id?: string
          challenger_result_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_challenged_result_id_fkey"
            columns: ["challenged_result_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_challenged_user_id_profiles_fkey"
            columns: ["challenged_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenges_challenger_id_profiles_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenges_challenger_result_id_fkey"
            columns: ["challenger_result_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          status: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          status?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          created_at: string
          difficulty: string
          field: string
          host_id: string
          id: string
          qualification: string | null
          questions: Json | null
          status: string
          stream: string | null
          subfield: string
          test_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          field?: string
          host_id: string
          id?: string
          qualification?: string | null
          questions?: Json | null
          status?: string
          stream?: string | null
          subfield?: string
          test_started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          field?: string
          host_id?: string
          id?: string
          qualification?: string | null
          questions?: Json | null
          status?: string
          stream?: string | null
          subfield?: string
          test_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lobby_members: {
        Row: {
          id: string
          joined_at: string
          lobby_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          lobby_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          lobby_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_members_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_test_results: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          id: string
          lobby_id: string
          scores: Json | null
          time_data: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          lobby_id: string
          scores?: Json | null
          time_data?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          lobby_id?: string
          scores?: Json | null
          time_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_test_results_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          id: string
          instagram_url: string | null
          is_online: boolean | null
          last_seen: string | null
          linkedin_url: string | null
          links: Json | null
          onboarding_complete: boolean
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          is_online?: boolean | null
          last_seen?: string | null
          linkedin_url?: string | null
          links?: Json | null
          onboarding_complete?: boolean
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          is_online?: boolean | null
          last_seen?: string | null
          linkedin_url?: string | null
          links?: Json | null
          onboarding_complete?: boolean
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          age_group: string
          ai_insight: string | null
          archetype_report: string | null
          blind_spots: string[] | null
          created_at: string
          creativity: number
          difficulty: string
          emotional_intelligence: number
          famous_match: string | null
          famous_match_reason: string | null
          field: string
          id: string
          intuition: number
          logic: number
          overall_score: number
          percentile: number
          subfield: string
          superpowers: string[] | null
          systems_thinking: number
          tier: number
          tier_title: string
          user_id: string
        }
        Insert: {
          age_group: string
          ai_insight?: string | null
          archetype_report?: string | null
          blind_spots?: string[] | null
          created_at?: string
          creativity?: number
          difficulty: string
          emotional_intelligence?: number
          famous_match?: string | null
          famous_match_reason?: string | null
          field: string
          id?: string
          intuition?: number
          logic?: number
          overall_score?: number
          percentile?: number
          subfield: string
          superpowers?: string[] | null
          systems_thinking?: number
          tier?: number
          tier_title?: string
          user_id: string
        }
        Update: {
          age_group?: string
          ai_insight?: string | null
          archetype_report?: string | null
          blind_spots?: string[] | null
          created_at?: string
          creativity?: number
          difficulty?: string
          emotional_intelligence?: number
          famous_match?: string | null
          famous_match_reason?: string | null
          field?: string
          id?: string
          intuition?: number
          logic?: number
          overall_score?: number
          percentile?: number
          subfield?: string
          superpowers?: string[] | null
          systems_thinking?: number
          tier?: number
          tier_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_global_rank: { Args: { target_user_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
