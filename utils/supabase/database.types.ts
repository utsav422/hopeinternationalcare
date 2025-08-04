export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_type: Database["public"]["Enums"]["duration_type"]
          duration_value: number
          id: string
          image_url: string | null
          level: number
          price: number
          slug: string
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_type?: Database["public"]["Enums"]["duration_type"]
          duration_value?: number
          id?: string
          image_url?: string | null
          level?: number
          price: number
          slug: string
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_type?: Database["public"]["Enums"]["duration_type"]
          duration_value?: number
          id?: string
          image_url?: string | null
          level?: number
          price?: number
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_course_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          cancelled_reason: string | null
          created_at: string
          enrollment_date: string | null
          id: string
          intake_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_intake_id_intakes_id_fk"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          capacity: number
          course_id: string | null
          created_at: string
          end_date: string
          id: string
          is_open: boolean | null
          start_date: string
          total_registered: number
        }
        Insert: {
          capacity?: number
          course_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_open?: boolean | null
          start_date: string
          total_registered?: number
        }
        Update: {
          capacity?: number
          course_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_open?: boolean | null
          start_date?: string
          total_registered?: number
        }
        Relationships: [
          {
            foreignKeyName: "intakes_course_id_courses_id_fk"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          enrollment_id: string | null
          id: string
          is_refunded: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          refunded_amount: number | null
          refunded_at: string | null
          remarks: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          enrollment_id?: string | null
          id?: string
          is_refunded?: boolean | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          enrollment_id?: string | null
          id?: string
          is_refunded?: boolean | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_enrollments_id_fk"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          enrollment_id: string | null
          id: string
          payment_id: string | null
          reason: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          enrollment_id?: string | null
          id?: string
          payment_id?: string | null
          reason: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          enrollment_id?: string | null
          id?: string
          payment_id?: string | null
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_enrollment_id_enrollments_id_fk"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_payments_id_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      duration_type: "days" | "week" | "month" | "year"
      enrollment_status: "requested" | "enrolled" | "cancelled" | "completed"
      payment_method: "cash" | "bank_transfer" | "mobile_wallets" | "fonepay"
      payment_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "failed"
        | "refunded"
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
      duration_type: ["days", "week", "month", "year"],
      enrollment_status: ["requested", "enrolled", "cancelled", "completed"],
      payment_method: ["cash", "bank_transfer", "mobile_wallets", "fonepay"],
      payment_status: [
        "pending",
        "completed",
        "cancelled",
        "failed",
        "refunded",
      ],
    },
  },
} as const
