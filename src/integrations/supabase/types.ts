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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assignee_id: string | null
          completed: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          meeting_id: string
          task_id: string | null
          title: string
        }
        Insert: {
          assignee_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id: string
          task_id?: string | null
          title: string
        }
        Update: {
          assignee_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_all_day: boolean | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          meeting_id: string | null
          project_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          project_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          project_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      meeting_attendees: {
        Row: {
          email: string | null
          id: string
          meeting_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          meeting_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          meeting_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          ai_notes: string | null
          ai_summary: string | null
          calendar_event_id: string | null
          combined_notes: string | null
          created_at: string | null
          host_id: string | null
          id: string
          meeting_link: string | null
          recording_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_notes: string | null
          workspace_id: string
        }
        Insert: {
          ai_notes?: string | null
          ai_summary?: string | null
          calendar_event_id?: string | null
          combined_notes?: string | null
          created_at?: string | null
          host_id?: string | null
          id?: string
          meeting_link?: string | null
          recording_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_notes?: string | null
          workspace_id: string
        }
        Update: {
          ai_notes?: string | null
          ai_summary?: string | null
          calendar_event_id?: string | null
          combined_notes?: string | null
          created_at?: string | null
          host_id?: string | null
          id?: string
          meeting_link?: string | null
          recording_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_notes?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          owner_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          depends_on_id: string
          id: string
          task_id: string
        }
        Insert: {
          depends_on_id: string
          id?: string
          task_id: string
        }
        Update: {
          depends_on_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          ai_priority_score: number | null
          assignee_id: string | null
          completed_at: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          do_date: string | null
          due_date: string | null
          duration_minutes: number | null
          id: string
          position: number | null
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          ai_priority_score?: number | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          do_date?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          position?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          ai_priority_score?: number | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          do_date?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          position?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          task_id: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
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
