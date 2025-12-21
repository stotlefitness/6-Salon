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
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_users_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
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
            referencedRelation: "salons"
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
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "salons"
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
            referencedRelation: "salons"
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
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
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
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
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
            referencedRelation: "bookings"
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
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phorest_appointment_id: string | null
          phone: string
          preferred_window: string
          request_source: Database["public"]["Enums"]["booking_request_source"]
          salon_id: string
          service_interest: string | null
          staff_note: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phorest_appointment_id?: string | null
          phone: string
          preferred_window: string
          request_source?: Database["public"]["Enums"]["booking_request_source"]
          salon_id: string
          service_interest?: string | null
          staff_note?: string | null
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phorest_appointment_id?: string | null
          phone?: string
          preferred_window?: string
          request_source?: Database["public"]["Enums"]["booking_request_source"]
          salon_id?: string
          service_interest?: string | null
          staff_note?: string | null
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
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
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
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
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_line_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_line_items_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
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
            referencedRelation: "checkout_sessions"
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
      booking_request_source: "kiosk" | "web" | "staff_manual"
      booking_request_status:
        | "new"
        | "in_progress"
        | "scheduled_in_phorest"
        | "closed"
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
      payment_status: "pending" | "authorized" | "captured" | "refunded" | "failed"
      visit_source: "kiosk_walkin" | "phorest_booking" | "staff_manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
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
    : never = never,
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
    : never = never,
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
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
