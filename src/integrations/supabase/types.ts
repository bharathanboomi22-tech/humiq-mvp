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
      companies: {
        Row: {
          analyzed_data: Json | null
          created_at: string
          description: string | null
          id: string
          name: string | null
          website_url: string
        }
        Insert: {
          analyzed_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          website_url: string
        }
        Update: {
          analyzed_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          website_url?: string
        }
        Relationships: []
      }
      discovery_conversations: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          messages: Json
          talent_profile_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          messages?: Json
          talent_profile_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          messages?: Json
          talent_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_conversations_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_packs: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          public_share_id: string
          session_id: string
          summary_json: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          public_share_id?: string
          session_id: string
          summary_json?: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          public_share_id?: string
          session_id?: string
          summary_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "evidence_packs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_requests: {
        Row: {
          company_id: string
          created_at: string
          id: string
          job_posting_id: string | null
          message: string | null
          requested_at: string
          responded_at: string | null
          status: string
          talent_profile_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          job_posting_id?: string | null
          message?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: string
          talent_profile_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          job_posting_id?: string | null
          message?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: string
          talent_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_requests_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_requests_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          analyzed_data: Json | null
          company_id: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          requirements: string | null
          title: string
        }
        Insert: {
          analyzed_data?: Json | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          requirements?: string | null
          title: string
        }
        Update: {
          analyzed_data?: Json | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          requirements?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      love_letters: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name_or_role: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name_or_role?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name_or_role?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          job_posting_id: string
          match_score: number
          score_breakdown: Json | null
          talent_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_posting_id: string
          match_score: number
          score_breakdown?: Json | null
          talent_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_posting_id?: string
          match_score?: number
          score_breakdown?: Json | null
          talent_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          allow_proof_requests: boolean | null
          availability_status: string | null
          consolidated_profile: Json | null
          created_at: string
          discovery_completed: boolean | null
          email: string | null
          github_url: string | null
          how_i_work: string | null
          id: string
          languages: string[] | null
          last_updated_at: string
          level: string | null
          location: string | null
          name: string | null
          onboarding_completed: boolean | null
          profile_visibility: string | null
          skills: Json | null
          timezone: string | null
          work_context: Json | null
          work_links: Json | null
        }
        Insert: {
          allow_proof_requests?: boolean | null
          availability_status?: string | null
          consolidated_profile?: Json | null
          created_at?: string
          discovery_completed?: boolean | null
          email?: string | null
          github_url?: string | null
          how_i_work?: string | null
          id?: string
          languages?: string[] | null
          last_updated_at?: string
          level?: string | null
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          profile_visibility?: string | null
          skills?: Json | null
          timezone?: string | null
          work_context?: Json | null
          work_links?: Json | null
        }
        Update: {
          allow_proof_requests?: boolean | null
          availability_status?: string | null
          consolidated_profile?: Json | null
          created_at?: string
          discovery_completed?: boolean | null
          email?: string | null
          github_url?: string | null
          how_i_work?: string | null
          id?: string
          languages?: string[] | null
          last_updated_at?: string
          level?: string | null
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          profile_visibility?: string | null
          skills?: Json | null
          timezone?: string | null
          work_context?: Json | null
          work_links?: Json | null
        }
        Relationships: []
      }
      talent_test_results: {
        Row: {
          analysis: Json | null
          completed_at: string
          created_at: string
          id: string
          scores_by_skill: Json
          talent_profile_id: string
          test_type: string
          work_session_id: string | null
        }
        Insert: {
          analysis?: Json | null
          completed_at?: string
          created_at?: string
          id?: string
          scores_by_skill?: Json
          talent_profile_id: string
          test_type: string
          work_session_id?: string | null
        }
        Update: {
          analysis?: Json | null
          completed_at?: string
          created_at?: string
          id?: string
          scores_by_skill?: Json
          talent_profile_id?: string
          test_type?: string
          work_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_test_results_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_test_results_work_session_id_fkey"
            columns: ["work_session_id"]
            isOneToOne: false
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_work_sessions: {
        Row: {
          created_at: string
          id: string
          talent_profile_id: string
          work_session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          talent_profile_id: string
          work_session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          talent_profile_id?: string
          work_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_work_sessions_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_work_sessions_work_session_id_fkey"
            columns: ["work_session_id"]
            isOneToOne: false
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      work_session_events: {
        Row: {
          content: Json
          created_at: string
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      work_session_stages: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          session_id: string
          stage_name: string
          started_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id: string
          stage_name: string
          started_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id?: string
          stage_name?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_session_stages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      work_sessions: {
        Row: {
          created_at: string
          duration: number
          ended_at: string | null
          github_brief: Json | null
          github_url: string
          id: string
          job_context: Json | null
          level: string
          raw_work_evidence: string | null
          role_track: string
          started_at: string
          status: string
          talent_profile_id: string | null
        }
        Insert: {
          created_at?: string
          duration: number
          ended_at?: string | null
          github_brief?: Json | null
          github_url: string
          id?: string
          job_context?: Json | null
          level: string
          raw_work_evidence?: string | null
          role_track: string
          started_at?: string
          status?: string
          talent_profile_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          ended_at?: string | null
          github_brief?: Json | null
          github_url?: string
          id?: string
          job_context?: Json | null
          level?: string
          raw_work_evidence?: string | null
          role_track?: string
          started_at?: string
          status?: string
          talent_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_talent_profile_id_fkey"
            columns: ["talent_profile_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      love_letters_public: {
        Row: {
          created_at: string | null
          id: string | null
          message: string | null
          name_or_role: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          name_or_role?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          name_or_role?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
