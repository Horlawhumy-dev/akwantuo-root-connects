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
      archive_items: {
        Row: {
          category: string
          content: string
          country: string
          created_at: string
          id: string
          image: string
          region: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          country: string
          created_at?: string
          id: string
          image: string
          region: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          country?: string
          created_at?: string
          id?: string
          image?: string
          region?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          host_id: string
          host_response: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stay_id: string
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id: string
          guests?: number
          host_id: string
          host_response?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stay_id: string
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: string
          guests?: number
          host_id?: string
          host_response?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stay_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellations: {
        Row: {
          booking_request_id: string
          cancelled_at: string
          created_at: string
          guest_id: string
          id: string
          original_amount: number
          reason: string | null
          refund_amount: number
          refund_percentage: number
        }
        Insert: {
          booking_request_id: string
          cancelled_at?: string
          created_at?: string
          guest_id: string
          id?: string
          original_amount?: number
          reason?: string | null
          refund_amount?: number
          refund_percentage?: number
        }
        Update: {
          booking_request_id?: string
          cancelled_at?: string
          created_at?: string
          guest_id?: string
          id?: string
          original_amount?: number
          reason?: string | null
          refund_amount?: number
          refund_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "cancellations_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: true
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          country: string
          created_at: string
          description: string
          id: string
          image: string
          landmarks: string[] | null
          tagline: string
          tier: number
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          id: string
          image: string
          landmarks?: string[] | null
          tagline: string
          tier?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          landmarks?: string[] | null
          tagline?: string
          tier?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          country: string
          created_at: string
          date_end: string | null
          date_start: string
          description: string
          id: string
          image: string
          name: string
          recurring: boolean
          region: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category?: string
          country?: string
          created_at?: string
          date_end?: string | null
          date_start: string
          description?: string
          id: string
          image?: string
          name: string
          recurring?: boolean
          region: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string
          country?: string
          created_at?: string
          date_end?: string | null
          date_start?: string
          description?: string
          id?: string
          image?: string
          name?: string
          recurring?: boolean
          region?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      festivals: {
        Row: {
          country: string
          created_at: string
          description: string
          highlights: string[] | null
          id: string
          image: string
          month: string
          name: string
          region: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          highlights?: string[] | null
          id: string
          image: string
          month: string
          name: string
          region: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          highlights?: string[] | null
          id?: string
          image?: string
          month?: string
          name?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      guide_requests: {
        Row: {
          created_at: string
          email: string
          end_date: string | null
          id: string
          message: string | null
          name: string
          region: string
          start_date: string
          status: Database["public"]["Enums"]["guide_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          end_date?: string | null
          id?: string
          message?: string | null
          name: string
          region: string
          start_date: string
          status?: Database["public"]["Enums"]["guide_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          end_date?: string | null
          id?: string
          message?: string | null
          name?: string
          region?: string
          start_date?: string
          status?: Database["public"]["Enums"]["guide_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          country: string
          created_at: string
          description: string
          emergency: boolean
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          country?: string
          created_at?: string
          description?: string
          emergency?: boolean
          id: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region: string
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          country?: string
          created_at?: string
          description?: string
          emergency?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          country: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      itinerary_items: {
        Row: {
          created_at: string
          day_number: number
          id: string
          item_id: string | null
          item_type: string
          itinerary_id: string
          notes: string | null
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          day_number?: number
          id?: string
          item_id?: string | null
          item_type: string
          itinerary_id: string
          notes?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          item_id?: string | null
          item_type?: string
          itinerary_id?: string
          notes?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_checklists: {
        Row: {
          checked_items: Json
          created_at: string
          id: string
          last_reminder_sent_at: string | null
          reminder_enabled: boolean
          trip_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_items?: Json
          created_at?: string
          id?: string
          last_reminder_sent_at?: string | null
          reminder_enabled?: boolean
          trip_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_items?: Json
          created_at?: string
          id?: string
          last_reminder_sent_at?: string | null
          reminder_enabled?: boolean
          trip_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_visibility: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          page_label: string
          page_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          page_label: string
          page_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          page_label?: string
          page_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_request_id: string
          created_at: string
          currency: string
          guest_id: string
          id: string
          paid_at: string | null
          provider: string
          provider_access_code: string | null
          provider_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_request_id: string
          created_at?: string
          currency?: string
          guest_id: string
          id?: string
          paid_at?: string | null
          provider?: string
          provider_access_code?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_request_id?: string
          created_at?: string
          currency?: string
          guest_id?: string
          id?: string
          paid_at?: string | null
          provider?: string
          provider_access_code?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: true
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          capital: string
          created_at: string
          description: string
          destination_id: string
          hidden_gems: string[] | null
          highlights: string[] | null
          id: string
          image: string
          name: string
          updated_at: string
        }
        Insert: {
          capital: string
          created_at?: string
          description: string
          destination_id: string
          hidden_gems?: string[] | null
          highlights?: string[] | null
          id: string
          image: string
          name: string
          updated_at?: string
        }
        Update: {
          capital?: string
          created_at?: string
          description?: string
          destination_id?: string
          hidden_gems?: string[] | null
          highlights?: string[] | null
          id?: string
          image?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_zones: {
        Row: {
          country: string
          created_at: string
          description: string
          id: string
          level: string
          name: string
          region: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          id: string
          level: string
          name: string
          region: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          id?: string
          level?: string
          name?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          created_at: string
          currency: string
          description: string
          id: string
          image_url: string | null
          is_service: boolean
          name: string
          price: number
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_url?: string | null
          is_service?: boolean
          name: string
          price?: number
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_url?: string | null
          is_service?: boolean
          name?: string
          price?: number
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          shop_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          shop_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          shop_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          category: string
          country: string
          created_at: string
          delivery_style: Database["public"]["Enums"]["delivery_style"]
          description: string
          email: string | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          region: string
          status: Database["public"]["Enums"]["shop_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string
          country?: string
          created_at?: string
          delivery_style?: Database["public"]["Enums"]["delivery_style"]
          description?: string
          email?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          region: string
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          country?: string
          created_at?: string
          delivery_style?: Database["public"]["Enums"]["delivery_style"]
          description?: string
          email?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          region?: string
          status?: Database["public"]["Enums"]["shop_status"]
          updated_at?: string
        }
        Relationships: []
      }
      stay_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          stay_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          stay_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          stay_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_reviews_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      stays: {
        Row: {
          amenities: string[] | null
          booking_url: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          description: string
          host_bio: string | null
          host_id: string
          host_name: string
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          price_per_night: number | null
          price_range: Database["public"]["Enums"]["price_range"]
          region: string
          status: Database["public"]["Enums"]["stay_status"]
          type: Database["public"]["Enums"]["stay_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          booking_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string
          description: string
          host_bio?: string | null
          host_id: string
          host_name: string
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_per_night?: number | null
          price_range?: Database["public"]["Enums"]["price_range"]
          region: string
          status?: Database["public"]["Enums"]["stay_status"]
          type: Database["public"]["Enums"]["stay_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          booking_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          description?: string
          host_bio?: string | null
          host_id?: string
          host_name?: string
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_per_night?: number | null
          price_range?: Database["public"]["Enums"]["price_range"]
          region?: string
          status?: Database["public"]["Enums"]["stay_status"]
          type?: Database["public"]["Enums"]["stay_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transport_hubs: {
        Row: {
          address: string | null
          country: string
          created_at: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          country?: string
          created_at?: string
          description?: string
          id: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region: string
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          country?: string
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status: "pending" | "accepted" | "declined" | "cancelled"
      delivery_style: "pickup" | "delivery" | "both"
      guide_request_status: "pending" | "contacted" | "resolved"
      price_range: "budget" | "mid_range" | "luxury"
      shop_status: "pending" | "approved" | "rejected"
      stay_status: "pending" | "approved" | "rejected"
      stay_type: "guesthouse" | "boutique_hotel" | "homestay"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: ["pending", "accepted", "declined", "cancelled"],
      delivery_style: ["pickup", "delivery", "both"],
      guide_request_status: ["pending", "contacted", "resolved"],
      price_range: ["budget", "mid_range", "luxury"],
      shop_status: ["pending", "approved", "rejected"],
      stay_status: ["pending", "approved", "rejected"],
      stay_type: ["guesthouse", "boutique_hotel", "homestay"],
    },
  },
} as const
