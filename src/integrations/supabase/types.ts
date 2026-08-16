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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          detail: Json | null
          entity: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          detail?: Json | null
          entity?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          detail?: Json | null
          entity?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_lines: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          org_id: string | null
          project_id: string
          wp_id: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string | null
          project_id: string
          wp_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string | null
          project_id?: string
          wp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_wp_id_fkey"
            columns: ["wp_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      call_requirements: {
        Row: {
          best_org_id: string | null
          created_at: string
          evidence: string | null
          id: string
          needed_expertise: string | null
          project_id: string
          requirement: string
          status: string
        }
        Insert: {
          best_org_id?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          needed_expertise?: string | null
          project_id: string
          requirement: string
          status?: string
        }
        Update: {
          best_org_id?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          needed_expertise?: string | null
          project_id?: string
          requirement?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_requirements_best_org_id_fkey"
            columns: ["best_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          id: string
          mime_type: string | null
          name: string
          project_id: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          project_id: string
          scores: Json | null
          summary: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          project_id: string
          scores?: Json | null
          summary?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          project_id?: string
          scores?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_votes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          ai_analysis: Json | null
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          project_id: string
          status: string
          title: string
        }
        Insert: {
          ai_analysis?: Json | null
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          project_id: string
          status?: string
          title: string
        }
        Update: {
          ai_analysis?: Json | null
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          project_id: string
          wp_id: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          project_id: string
          wp_id?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          wp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_wp_id_fkey"
            columns: ["wp_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          capabilities: string | null
          contact_email: string | null
          contact_person: string | null
          country: string
          country_code: string
          created_at: string
          expertise: string | null
          id: string
          infrastructure: string | null
          name: string
          org_type: string | null
          phone: string | null
          pic_number: string | null
          previous_projects: string | null
          proposed_contribution: string | null
          short_name: string | null
          staff: string | null
          target_groups: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          capabilities?: string | null
          contact_email?: string | null
          contact_person?: string | null
          country?: string
          country_code?: string
          created_at?: string
          expertise?: string | null
          id?: string
          infrastructure?: string | null
          name: string
          org_type?: string | null
          phone?: string | null
          pic_number?: string | null
          previous_projects?: string | null
          proposed_contribution?: string | null
          short_name?: string | null
          staff?: string | null
          target_groups?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          capabilities?: string | null
          contact_email?: string | null
          contact_person?: string | null
          country?: string
          country_code?: string
          created_at?: string
          expertise?: string | null
          id?: string
          infrastructure?: string | null
          name?: string
          org_type?: string | null
          phone?: string | null
          pic_number?: string | null
          previous_projects?: string | null
          proposed_contribution?: string | null
          short_name?: string | null
          staff?: string | null
          target_groups?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          org_id: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          org_id?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          email: string
          id: string
          invited_at: string
          joined_at: string | null
          org_id: string | null
          project_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          org_id?: string | null
          project_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          org_id?: string | null
          project_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          abstract: string | null
          call_url: string | null
          code: string
          coordinator_org_id: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          id: string
          programme: string | null
          status: string
          title: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          call_url?: string | null
          code: string
          coordinator_org_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          programme?: string | null
          status?: string
          title: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          call_url?: string | null
          code?: string
          coordinator_org_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          programme?: string | null
          status?: string
          title?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_coordinator_org_id_fkey"
            columns: ["coordinator_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_sections: {
        Row: {
          content: string
          contributed_by: string | null
          contributed_org_id: string | null
          id: string
          part: string
          position: number
          project_id: string
          section_key: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          contributed_by?: string | null
          contributed_org_id?: string | null
          id?: string
          part: string
          position?: number
          project_id: string
          section_key: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          contributed_by?: string | null
          contributed_org_id?: string | null
          id?: string
          part?: string
          position?: number
          project_id?: string
          section_key?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_sections_contributed_org_id_fkey"
            columns: ["contributed_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_org_id: string | null
          assignee_user_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          project_id: string
          status: string
          title: string
          wp_id: string | null
        }
        Insert: {
          assignee_org_id?: string | null
          assignee_user_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          project_id: string
          status?: string
          title: string
          wp_id?: string | null
        }
        Update: {
          assignee_org_id?: string | null
          assignee_user_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          project_id?: string
          status?: string
          title?: string
          wp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_org_id_fkey"
            columns: ["assignee_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_wp_id_fkey"
            columns: ["wp_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_packages: {
        Row: {
          budget: number | null
          created_at: string
          deliverables: string | null
          end_month: number | null
          id: string
          kpis: string | null
          lead_org_id: string | null
          milestones: string | null
          number: number
          objective: string | null
          progress: number
          project_id: string
          start_month: number | null
          title: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          deliverables?: string | null
          end_month?: number | null
          id?: string
          kpis?: string | null
          lead_org_id?: string | null
          milestones?: string | null
          number: number
          objective?: string | null
          progress?: number
          project_id: string
          start_month?: number | null
          title: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          deliverables?: string | null
          end_month?: number | null
          id?: string
          kpis?: string | null
          lead_org_id?: string | null
          milestones?: string | null
          number?: number
          objective?: string | null
          progress?: number
          project_id?: string
          start_month?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_packages_lead_org_id_fkey"
            columns: ["lead_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_packages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_contribute: { Args: { _project_id: string }; Returns: boolean }
      can_manage_project: { Args: { _project_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: { Args: { _project_id: string }; Returns: boolean }
      shares_project_with_org: { Args: { _org_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "coordinator"
        | "partner_admin"
        | "partner_member"
        | "reviewer"
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
      app_role: [
        "super_admin",
        "coordinator",
        "partner_admin",
        "partner_member",
        "reviewer",
      ],
    },
  },
} as const
