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
      booking_requests: {
        Row: {
          created_at: string
          customer_id: string | null
          duration_minutes: number
          id: string
          notes: string | null
          phone: string
          phorest_appointment_id: string | null
          preferred_start_time: string | null
          preferred_stylist_id: string | null
          salon_id: string
          service_id: string
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          phone: string
          phorest_appointment_id?: string | null
          preferred_start_time?: string | null
          preferred_stylist_id?: string | null
          salon_id: string
          service_id: string
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          phone?: string
          phorest_appointment_id?: string | null
          preferred_start_time?: string | null
          preferred_stylist_id?: string | null
          salon_id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_preferred_stylist_id_fkey"
            columns: ["preferred_stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_services: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          price_cents: number
          quantity: number
          service_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          price_cents: number
          quantity?: number
          service_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          price_cents?: number
          quantity?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          checked_in_at: string | null
          created_at: string
          customer_id: string
          end_time: string | null
          id: string
          notes: string | null
          salon_id: string
          service_id: string
          source: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          stylist_id: string | null
          total_amount_cents: number
          updated_at: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          customer_id: string
          end_time?: string | null
          id?: string
          notes?: string | null
          salon_id: string
          service_id: string
          source?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          stylist_id?: string | null
          total_amount_cents?: number
          updated_at?: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          customer_id?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          salon_id?: string
          service_id?: string
          source?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          stylist_id?: string | null
          total_amount_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_line_items: {
        Row: {
          checkout_session_id: string
          created_at: string
          description: string | null
          id: string
          item_type: Database["public"]["Enums"]["checkout_line_item_type"]
          product_id: string | null
          quantity: number
          service_id: string | null
          total_price_cents: number
          unit_price_cents: number
        }
        Insert: {
          checkout_session_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_type: Database["public"]["Enums"]["checkout_line_item_type"]
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_price_cents: number
          unit_price_cents: number
        }
        Update: {
          checkout_session_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["checkout_line_item_type"]
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_price_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "checkout_line_items_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_line_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_line_items_session_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_sessions: {
        Row: {
          booking_id: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          id: string
          last_stripe_event_at: string | null
          last_stripe_event_id: string | null
          last_stripe_event_type: string | null
          salon_id: string
          status: Database["public"]["Enums"]["checkout_session_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_cents: number
          tax_cents: number
          tip_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          last_stripe_event_at?: string | null
          last_stripe_event_id?: string | null
          last_stripe_event_type?: string | null
          salon_id: string
          status?: Database["public"]["Enums"]["checkout_session_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tip_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          last_stripe_event_at?: string | null
          last_stripe_event_id?: string | null
          last_stripe_event_type?: string | null
          salon_id?: string
          status?: Database["public"]["Enums"]["checkout_session_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tip_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          phone_normalized: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          phone_normalized: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          phone_normalized?: string
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          external_id: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          retail_sku: string | null
          salon_id: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          retail_sku?: string | null
          salon_id: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          retail_sku?: string | null
          salon_id?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          created_at: string
          display_name: string
          id: string
          role: string
          salon_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          role: string
          salon_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          role?: string
          salon_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_users_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          checkout_session_id: string | null
          created_at: string
          event_id: string
          id: string
          type: string | null
        }
        Insert: {
          checkout_session_id?: string | null
          created_at?: string
          event_id: string
          id?: string
          type?: string | null
        }
        Update: {
          checkout_session_id?: string | null
          created_at?: string
          event_id?: string
          id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_events_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stylists: {
        Row: {
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          role?: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          role?: string
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylists_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          booking_id: string | null
          checked_in_at: string
          completed_at: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          phorest_appointment_id: string | null
          salon_id: string
          updated_at: string
          visit_source: Database["public"]["Enums"]["visit_source"]
        }
        Insert: {
          booking_id?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          phorest_appointment_id?: string | null
          salon_id: string
          updated_at?: string
          visit_source?: Database["public"]["Enums"]["visit_source"]
        }
        Update: {
          booking_id?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          phorest_appointment_id?: string | null
          salon_id?: string
          updated_at?: string
          visit_source?: Database["public"]["Enums"]["visit_source"]
        }
        Relationships: [
          {
            foreignKeyName: "visits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      normalize_phone_sql: { Args: { raw: string }; Returns: string }
    }
    Enums: {
      booking_request_source: "kiosk" | "web" | "staff_manual"
      booking_request_status: "pending" | "scheduled" | "cancelled"
      booking_status:
        | "scheduled"
        | "checked_in"
        | "in_service"
        | "completed"
        | "cancelled"
        | "no_show"
      checkout_line_item_type: "service" | "product" | "tip"
      checkout_session_status: "pending" | "completed" | "cancelled" | "failed"
      payment_method: "card" | "cash" | "gift_card" | "external"
      payment_status:
        | "pending"
        | "authorized"
        | "captured"
        | "refunded"
        | "failed"
      visit_source: "kiosk_walkin" | "phorest_booking" | "staff_manual"
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
      booking_request_source: ["kiosk", "web", "staff_manual"],
      booking_request_status: ["pending", "scheduled", "cancelled"],
      booking_status: [
        "scheduled",
        "checked_in",
        "in_service",
        "completed",
        "cancelled",
        "no_show",
      ],
      checkout_line_item_type: ["service", "product", "tip"],
      checkout_session_status: ["pending", "completed", "cancelled", "failed"],
      payment_method: ["card", "cash", "gift_card", "external"],
      payment_status: [
        "pending",
        "authorized",
        "captured",
        "refunded",
        "failed",
      ],
      visit_source: ["kiosk_walkin", "phorest_booking", "staff_manual"],
    },
  },
} as const
