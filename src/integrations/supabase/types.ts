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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      build_logs: {
        Row: {
          created_at: string | null
          id: string
          log_type: string | null
          message: string | null
          metadata: Json | null
          order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_type?: string | null
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_type?: string | null
          message?: string | null
          metadata?: Json | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "build_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          content: Json | null
          created_at: string | null
          current_step: number | null
          id: string
          model: string | null
          name: string | null
          scraped_content: Json | null
          scraped_url: string | null
          sections: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          model?: string | null
          name?: string | null
          scraped_content?: Json | null
          scraped_url?: string | null
          sections?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          model?: string | null
          name?: string | null
          scraped_content?: Json | null
          scraped_url?: string | null
          sections?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          changes: Json
          created_at: string | null
          id: string
          iteration_number: number
          order_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          changes: Json
          created_at?: string | null
          id?: string
          iteration_number: number
          order_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          changes?: Json
          created_at?: string | null
          id?: string
          iteration_number?: number
          order_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          how_i_know_them: string | null
          id: string
          last_contact_date: string | null
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string | null
          what_they_might_need: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          how_i_know_them?: string | null
          id?: string
          last_contact_date?: string | null
          name: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          what_they_might_need?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          how_i_know_them?: string | null
          id?: string
          last_contact_date?: string | null
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          what_they_might_need?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_paid: number | null
          build_completed_at: string | null
          build_started_at: string | null
          created_at: string | null
          draft_id: string | null
          id: string
          iteration_count: number | null
          max_iterations: number | null
          order_number: string
          preview_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          spec: Json
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          build_completed_at?: string | null
          build_started_at?: string | null
          created_at?: string | null
          draft_id?: string | null
          id?: string
          iteration_count?: number | null
          max_iterations?: number | null
          order_number: string
          preview_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spec: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          build_completed_at?: string | null
          build_started_at?: string | null
          created_at?: string | null
          draft_id?: string | null
          id?: string
          iteration_count?: number | null
          max_iterations?: number | null
          order_number?: string
          preview_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spec?: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          hourly_rate: number
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          project_type: string
          start_date: string | null
          status: string
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          hourly_rate?: number
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          project_type?: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          hourly_rate?: number
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          project_type?: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invited_email: string
          invited_name: string | null
          notes: string | null
          status: string
          submitted_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          invited_email: string
          invited_name?: string | null
          notes?: string | null
          status?: string
          submitted_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_email?: string
          invited_name?: string | null
          notes?: string | null
          status?: string
          submitted_at?: string | null
          token?: string
        }
        Relationships: []
      }
      references: {
        Row: {
          approved_at: string | null
          created_at: string
          display_order: number
          email: string
          headline: string
          id: string
          linkedin_url: string | null
          name: string
          request_id: string
          role_title: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          display_order?: number
          email: string
          headline: string
          id?: string
          linkedin_url?: string | null
          name: string
          request_id: string
          role_title: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          display_order?: number
          email?: string
          headline?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          request_id?: string
          role_title?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "references_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "reference_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string | null
          date: string
          description: string
          hours: number
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          description: string
          hours: number
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          hours?: number
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warm_lead_settings: {
        Row: {
          created_at: string
          id: string
          last_run_at: string | null
          mode: string
          outreach_voice: string
          target_per_week: number
          this_week_count: number
          threshold: number
          updated_at: string
          week_started_on: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_run_at?: string | null
          mode?: string
          outreach_voice?: string
          target_per_week?: number
          this_week_count?: number
          threshold?: number
          updated_at?: string
          week_started_on?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_run_at?: string | null
          mode?: string
          outreach_voice?: string
          target_per_week?: number
          this_week_count?: number
          threshold?: number
          updated_at?: string
          week_started_on?: string
        }
        Relationships: []
      }
      warm_lead_sources: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          label: string
          last_error: string | null
          last_run_at: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id: string
          label: string
          last_error?: string | null
          last_run_at?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          last_error?: string | null
          last_run_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      warm_leads: {
        Row: {
          author_display_name: string | null
          author_handle: string | null
          created_at: string
          draft_generated_at: string | null
          drafted_message: string | null
          external_id: string
          id: string
          matched_keywords: string[]
          posted_at: string | null
          promoted_lead_id: string | null
          raw_excerpt: string
          raw_title: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          score: number
          score_reasoning: string | null
          source_id: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          author_display_name?: string | null
          author_handle?: string | null
          created_at?: string
          draft_generated_at?: string | null
          drafted_message?: string | null
          external_id: string
          id?: string
          matched_keywords?: string[]
          posted_at?: string | null
          promoted_lead_id?: string | null
          raw_excerpt: string
          raw_title?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          score?: number
          score_reasoning?: string | null
          source_id: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          author_display_name?: string | null
          author_handle?: string | null
          created_at?: string
          draft_generated_at?: string | null
          drafted_message?: string | null
          external_id?: string
          id?: string
          matched_keywords?: string[]
          posted_at?: string | null
          promoted_lead_id?: string | null
          raw_excerpt?: string
          raw_title?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          score?: number
          score_reasoning?: string | null
          source_id?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "warm_leads_promoted_lead_id_fkey"
            columns: ["promoted_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warm_leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "warm_lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      approved_references_public: {
        Row: {
          created_at: string | null
          display_order: number | null
          headline: string | null
          id: string | null
          linkedin_url: string | null
          name: string | null
          role_title: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          headline?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          role_title?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          headline?: string | null
          id?: string | null
          linkedin_url?: string | null
          name?: string | null
          role_title?: string | null
        }
        Relationships: []
      }
      warm_leads_with_source: {
        Row: {
          author_display_name: string | null
          author_handle: string | null
          created_at: string | null
          draft_generated_at: string | null
          drafted_message: string | null
          external_id: string | null
          id: string | null
          matched_keywords: string[] | null
          posted_at: string | null
          promoted_lead_id: string | null
          raw_excerpt: string | null
          raw_title: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          score: number | null
          score_reasoning: string | null
          source_id: string | null
          source_label: string | null
          status: string | null
          updated_at: string | null
          url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warm_leads_promoted_lead_id_fkey"
            columns: ["promoted_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warm_leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "warm_lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
