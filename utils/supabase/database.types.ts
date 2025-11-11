export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '13.0.5';
    };
    public: {
        Tables: {
            affiliations: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    type: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    type: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    type?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            course_categories: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            courses: {
                Row: {
                    affiliation_id: string | null;
                    category_id: string | null;
                    course_highlights: string | null;
                    course_overview: string | null;
                    created_at: string;
                    duration_type: Database['public']['Enums']['duration_type'];
                    duration_value: number;
                    id: string;
                    image_url: string | null;
                    level: number;
                    price: number;
                    slug: string;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    affiliation_id?: string | null;
                    category_id?: string | null;
                    course_highlights?: string | null;
                    course_overview?: string | null;
                    created_at?: string;
                    duration_type?: Database['public']['Enums']['duration_type'];
                    duration_value?: number;
                    id?: string;
                    image_url?: string | null;
                    level?: number;
                    price: number;
                    slug: string;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    affiliation_id?: string | null;
                    category_id?: string | null;
                    course_highlights?: string | null;
                    course_overview?: string | null;
                    created_at?: string;
                    duration_type?: Database['public']['Enums']['duration_type'];
                    duration_value?: number;
                    id?: string;
                    image_url?: string | null;
                    level?: number;
                    price?: number;
                    slug?: string;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'courses_affiliation_id_affiliations_id_fk';
                        columns: ['affiliation_id'];
                        isOneToOne: false;
                        referencedRelation: 'affiliations';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'courses_category_id_course_categories_id_fk';
                        columns: ['category_id'];
                        isOneToOne: false;
                        referencedRelation: 'course_categories';
                        referencedColumns: ['id'];
                    },
                ];
            };
            customer_contact_replies: {
                Row: {
                    admin_email: string | null;
                    admin_id: string | null;
                    batch_id: string | null;
                    clicked_at: string | null;
                    contact_request_id: string;
                    created_at: string;
                    delivered_at: string | null;
                    email_status: string;
                    error_message: string | null;
                    id: string;
                    is_batch_reply: string;
                    message: string;
                    opened_at: string | null;
                    reply_to_email: string;
                    reply_to_name: string;
                    resend_email_id: string | null;
                    resend_response: Json | null;
                    sent_at: string;
                    subject: string;
                    updated_at: string;
                };
                Insert: {
                    admin_email?: string | null;
                    admin_id?: string | null;
                    batch_id?: string | null;
                    clicked_at?: string | null;
                    contact_request_id: string;
                    created_at?: string;
                    delivered_at?: string | null;
                    email_status?: string;
                    error_message?: string | null;
                    id?: string;
                    is_batch_reply?: string;
                    message: string;
                    opened_at?: string | null;
                    reply_to_email: string;
                    reply_to_name: string;
                    resend_email_id?: string | null;
                    resend_response?: Json | null;
                    sent_at?: string;
                    subject: string;
                    updated_at?: string;
                };
                Update: {
                    admin_email?: string | null;
                    admin_id?: string | null;
                    batch_id?: string | null;
                    clicked_at?: string | null;
                    contact_request_id?: string;
                    created_at?: string;
                    delivered_at?: string | null;
                    email_status?: string;
                    error_message?: string | null;
                    id?: string;
                    is_batch_reply?: string;
                    message?: string;
                    opened_at?: string | null;
                    reply_to_email?: string;
                    reply_to_name?: string;
                    resend_email_id?: string | null;
                    resend_response?: Json | null;
                    sent_at?: string;
                    subject?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'customer_contact_replies_contact_request_id_customer_contact_re';
                        columns: ['contact_request_id'];
                        isOneToOne: false;
                        referencedRelation: 'customer_contact_requests';
                        referencedColumns: ['id'];
                    },
                ];
            };
            customer_contact_requests: {
                Row: {
                    created_at: string;
                    email: string;
                    id: string;
                    message: string;
                    name: string;
                    phone: string | null;
                    status: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    email: string;
                    id?: string;
                    message: string;
                    name: string;
                    phone?: string | null;
                    status?: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string;
                    id?: string;
                    message?: string;
                    name?: string;
                    phone?: string | null;
                    status?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            email_logs: {
                Row: {
                    admin_id: string | null;
                    batch_id: string | null;
                    clicked_at: string | null;
                    created_at: string;
                    delivered_at: string | null;
                    email_type: string | null;
                    error_message: string | null;
                    from_email: string;
                    html_content: string | null;
                    id: string;
                    opened_at: string | null;
                    related_entity_id: string | null;
                    related_entity_type: string | null;
                    reply_to: string | null;
                    resend_email_id: string | null;
                    resend_response: Json | null;
                    sent_at: string;
                    status: string;
                    subject: string;
                    template_used: string | null;
                    text_content: string | null;
                    to_emails: Json;
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    admin_id?: string | null;
                    batch_id?: string | null;
                    clicked_at?: string | null;
                    created_at?: string;
                    delivered_at?: string | null;
                    email_type?: string | null;
                    error_message?: string | null;
                    from_email: string;
                    html_content?: string | null;
                    id?: string;
                    opened_at?: string | null;
                    related_entity_id?: string | null;
                    related_entity_type?: string | null;
                    reply_to?: string | null;
                    resend_email_id?: string | null;
                    resend_response?: Json | null;
                    sent_at?: string;
                    status?: string;
                    subject: string;
                    template_used?: string | null;
                    text_content?: string | null;
                    to_emails: Json;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    admin_id?: string | null;
                    batch_id?: string | null;
                    clicked_at?: string | null;
                    created_at?: string;
                    delivered_at?: string | null;
                    email_type?: string | null;
                    error_message?: string | null;
                    from_email?: string;
                    html_content?: string | null;
                    id?: string;
                    opened_at?: string | null;
                    related_entity_id?: string | null;
                    related_entity_type?: string | null;
                    reply_to?: string | null;
                    resend_email_id?: string | null;
                    resend_response?: Json | null;
                    sent_at?: string;
                    status?: string;
                    subject?: string;
                    template_used?: string | null;
                    text_content?: string | null;
                    to_emails?: Json;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            enrollments: {
                Row: {
                    cancelled_reason: string | null;
                    created_at: string;
                    enrollment_date: string | null;
                    id: string;
                    intake_id: string | null;
                    notes: string | null;
                    status: Database['public']['Enums']['enrollment_status'];
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    cancelled_reason?: string | null;
                    created_at?: string;
                    enrollment_date?: string | null;
                    id?: string;
                    intake_id?: string | null;
                    notes?: string | null;
                    status?: Database['public']['Enums']['enrollment_status'];
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    cancelled_reason?: string | null;
                    created_at?: string;
                    enrollment_date?: string | null;
                    id?: string;
                    intake_id?: string | null;
                    notes?: string | null;
                    status?: Database['public']['Enums']['enrollment_status'];
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'enrollments_intake_id_intakes_id_fk';
                        columns: ['intake_id'];
                        isOneToOne: false;
                        referencedRelation: 'intakes';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'enrollments_user_id_profiles_id_fk';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
            intakes: {
                Row: {
                    capacity: number;
                    course_id: string | null;
                    created_at: string;
                    end_date: string;
                    id: string;
                    is_open: boolean | null;
                    start_date: string;
                    total_registered: number;
                    updated_at: string;
                };
                Insert: {
                    capacity?: number;
                    course_id?: string | null;
                    created_at?: string;
                    end_date: string;
                    id?: string;
                    is_open?: boolean | null;
                    start_date: string;
                    total_registered?: number;
                    updated_at?: string;
                };
                Update: {
                    capacity?: number;
                    course_id?: string | null;
                    created_at?: string;
                    end_date?: string;
                    id?: string;
                    is_open?: boolean | null;
                    start_date?: string;
                    total_registered?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'intakes_course_id_courses_id_fk';
                        columns: ['course_id'];
                        isOneToOne: false;
                        referencedRelation: 'courses';
                        referencedColumns: ['id'];
                    },
                ];
            };
            payments: {
                Row: {
                    amount: number;
                    created_at: string;
                    enrollment_id: string | null;
                    id: string;
                    is_refunded: boolean | null;
                    method: Database['public']['Enums']['payment_method'];
                    paid_at: string | null;
                    refunded_amount: number | null;
                    refunded_at: string | null;
                    remarks: string | null;
                    status: Database['public']['Enums']['payment_status'];
                    updated_at: string;
                };
                Insert: {
                    amount: number;
                    created_at?: string;
                    enrollment_id?: string | null;
                    id?: string;
                    is_refunded?: boolean | null;
                    method?: Database['public']['Enums']['payment_method'];
                    paid_at?: string | null;
                    refunded_amount?: number | null;
                    refunded_at?: string | null;
                    remarks?: string | null;
                    status?: Database['public']['Enums']['payment_status'];
                    updated_at?: string;
                };
                Update: {
                    amount?: number;
                    created_at?: string;
                    enrollment_id?: string | null;
                    id?: string;
                    is_refunded?: boolean | null;
                    method?: Database['public']['Enums']['payment_method'];
                    paid_at?: string | null;
                    refunded_amount?: number | null;
                    refunded_at?: string | null;
                    remarks?: string | null;
                    status?: Database['public']['Enums']['payment_status'];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'payments_enrollment_id_enrollments_id_fk';
                        columns: ['enrollment_id'];
                        isOneToOne: false;
                        referencedRelation: 'enrollments';
                        referencedColumns: ['id'];
                    },
                ];
            };
            profiles: {
                Row: {
                    created_at: string;
                    deleted_at: string | null;
                    deletion_count: number;
                    deletion_scheduled_for: string | null;
                    email: string;
                    full_name: string;
                    id: string;
                    phone: string | null;
                    role: string | null;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    deleted_at?: string | null;
                    deletion_count?: number;
                    deletion_scheduled_for?: string | null;
                    email: string;
                    full_name: string;
                    id: string;
                    phone?: string | null;
                    role?: string | null;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    deleted_at?: string | null;
                    deletion_count?: number;
                    deletion_scheduled_for?: string | null;
                    email?: string;
                    full_name?: string;
                    id?: string;
                    phone?: string | null;
                    role?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            refunds: {
                Row: {
                    amount: number;
                    created_at: string;
                    enrollment_id: string | null;
                    id: string;
                    payment_id: string;
                    reason: string;
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    amount: number;
                    created_at?: string;
                    enrollment_id?: string | null;
                    id?: string;
                    payment_id: string;
                    reason: string;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    amount?: number;
                    created_at?: string;
                    enrollment_id?: string | null;
                    id?: string;
                    payment_id?: string;
                    reason?: string;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'refunds_enrollment_id_enrollments_id_fk';
                        columns: ['enrollment_id'];
                        isOneToOne: false;
                        referencedRelation: 'enrollments';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'refunds_payment_id_payments_id_fk';
                        columns: ['payment_id'];
                        isOneToOne: false;
                        referencedRelation: 'payments';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'refunds_user_id_profiles_id_fk';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            duration_type: 'days' | 'week' | 'month' | 'year';
            enrollment_status:
                | 'requested'
                | 'enrolled'
                | 'cancelled'
                | 'completed';
            payment_method:
                | 'cash'
                | 'bank_transfer'
                | 'mobile_wallets'
                | 'fonepay';
            payment_status:
                | 'pending'
                | 'completed'
                | 'cancelled'
                | 'failed'
                | 'refunded';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    'public'
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema['Enums']
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            duration_type: ['days', 'week', 'month', 'year'],
            enrollment_status: [
                'requested',
                'enrolled',
                'cancelled',
                'completed',
            ],
            payment_method: [
                'cash',
                'bank_transfer',
                'mobile_wallets',
                'fonepay',
            ],
            payment_status: [
                'pending',
                'completed',
                'cancelled',
                'failed',
                'refunded',
            ],
        },
    },
} as const;
