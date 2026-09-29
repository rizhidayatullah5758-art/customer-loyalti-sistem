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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_label: string | null
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_label?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          metadata?: Json
        }
        Update: {
          action?: string
          actor_label?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          metadata?: Json
        }
        Relationships: []
      }
      banners: {
        Row: {
          action_type: string
          action_value: string | null
          active: boolean
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          image_path: string
          sort_order: number
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          action_value?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          image_path: string
          sort_order?: number
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          action_value?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          image_path?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      birthday_rewards: {
        Row: {
          booking_id: string | null
          created_at: string
          expires_on: string
          id: string
          member_id: string
          reward_year: number
          starts_on: string
          status: string
          used_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          expires_on: string
          id?: string
          member_id: string
          reward_year: number
          starts_on: string
          status?: string
          used_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          expires_on?: string
          id?: string
          member_id?: string
          reward_year?: number
          starts_on?: string
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "birthday_rewards_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birthday_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "birthday_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "birthday_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      booking_reschedules: {
        Row: {
          booking_id: string
          created_at: string
          from_slot_id: string
          id: string
          member_id: string
          reschedule_number: number
          to_slot_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          from_slot_id: string
          id?: string
          member_id: string
          reschedule_number: number
          to_slot_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          from_slot_id?: string
          id?: string
          member_id?: string
          reschedule_number?: number
          to_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reschedules_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reschedules_from_slot_id_fkey"
            columns: ["from_slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reschedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "booking_reschedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "booking_reschedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "booking_reschedules_to_slot_id_fkey"
            columns: ["to_slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slots: {
        Row: {
          capacity: number
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          notes: string | null
          priority_only: boolean
          public_release_at: string | null
          service_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          priority_only?: boolean
          public_release_at?: string | null
          service_id: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          priority_only?: boolean
          public_release_at?: string | null
          service_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_code: string
          booking_number: number
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_forfeited: boolean
          deposit_required: number
          id: string
          member_id: string
          no_show_at: string | null
          notes: string | null
          original_booking_id: string | null
          quoted_total: number
          reschedule_count: number
          service_id: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          treatment_started_at: string | null
          updated_at: string
          used_priority_access: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        Insert: {
          booking_code: string
          booking_number?: number
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deposit_forfeited?: boolean
          deposit_required?: number
          id?: string
          member_id: string
          no_show_at?: string | null
          notes?: string | null
          original_booking_id?: string | null
          quoted_total: number
          reschedule_count?: number
          service_id: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          treatment_started_at?: string | null
          updated_at?: string
          used_priority_access?: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        Update: {
          booking_code?: string
          booking_number?: number
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deposit_forfeited?: boolean
          deposit_required?: number
          id?: string
          member_id?: string
          no_show_at?: string | null
          notes?: string | null
          original_booking_id?: string | null
          quoted_total?: number
          reschedule_count?: number
          service_id?: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          treatment_started_at?: string | null
          updated_at?: string
          used_priority_access?: boolean
          vehicle_category?: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_original_booking_id_fkey"
            columns: ["original_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          member_id: string
          override_reason: string | null
          payment_id: string | null
          staff_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          member_id: string
          override_reason?: string | null
          payment_id?: string | null
          staff_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          member_id?: string
          override_reason?: string | null
          payment_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "checkins_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      coating_warranties: {
        Row: {
          booking_id: string
          created_at: string
          ends_on: string
          id: string
          member_id: string
          next_maintenance_on: string | null
          notes: string | null
          starts_on: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          ends_on: string
          id?: string
          member_id: string
          next_maintenance_on?: string | null
          notes?: string | null
          starts_on: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          ends_on?: string
          id?: string
          member_id?: string
          next_maintenance_on?: string | null
          notes?: string | null
          starts_on?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coating_warranties_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coating_warranties_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "coating_warranties_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "coating_warranties_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_directory: {
        Row: {
          avatar_path: string | null
          full_name: string
          member_code: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_path?: string | null
          full_name: string
          member_code: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_path?: string | null
          full_name?: string
          member_code?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_directory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_directory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_directory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          activated_at: string | null
          avatar_path: string | null
          birth_date: string
          birth_date_edit_count: number
          created_at: string
          email: string
          full_name: string
          marketing_notifications: boolean
          member_code: string
          member_number: number
          onboarding_completed: boolean
          referral_code: string
          referred_by: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          activated_at?: string | null
          avatar_path?: string | null
          birth_date: string
          birth_date_edit_count?: number
          created_at?: string
          email: string
          full_name: string
          marketing_notifications?: boolean
          member_code: string
          member_number?: number
          onboarding_completed?: boolean
          referral_code: string
          referred_by?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          activated_at?: string | null
          avatar_path?: string | null
          birth_date?: string
          birth_date_edit_count?: number
          created_at?: string
          email?: string
          full_name?: string
          marketing_notifications?: boolean
          member_code?: string
          member_number?: number
          onboarding_completed?: boolean
          referral_code?: string
          referred_by?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_rewards: {
        Row: {
          benefit_template_id: string | null
          booking_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          member_id: string
          points_spent: number
          reward_catalog_id: string | null
          source: string
          status: string
          used_at: string | null
        }
        Insert: {
          benefit_template_id?: string | null
          booking_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          member_id: string
          points_spent?: number
          reward_catalog_id?: string | null
          source: string
          status?: string
          used_at?: string | null
        }
        Update: {
          benefit_template_id?: string | null
          booking_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          member_id?: string
          points_spent?: number
          reward_catalog_id?: string | null
          source?: string
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_rewards_benefit_template_id_fkey"
            columns: ["benefit_template_id"]
            isOneToOne: false
            referencedRelation: "membership_benefit_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_rewards_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_rewards_reward_catalog_id_fkey"
            columns: ["reward_catalog_id"]
            isOneToOne: false
            referencedRelation: "reward_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_benefit_templates: {
        Row: {
          active: boolean
          amount: number | null
          benefit_type: string
          code: string
          id: string
          level: Database["public"]["Enums"]["membership_level"]
          min_transaction: number
          period_days: number | null
          title_id: string
        }
        Insert: {
          active?: boolean
          amount?: number | null
          benefit_type: string
          code: string
          id?: string
          level: Database["public"]["Enums"]["membership_level"]
          min_transaction?: number
          period_days?: number | null
          title_id: string
        }
        Update: {
          active?: boolean
          amount?: number | null
          benefit_type?: string
          code?: string
          id?: string
          level?: Database["public"]["Enums"]["membership_level"]
          min_transaction?: number
          period_days?: number | null
          title_id?: string
        }
        Relationships: []
      }
      membership_levels: {
        Row: {
          daily_priority_reservations: number
          early_access_hours: number
          level: Database["public"]["Enums"]["membership_level"]
          min_qualifying_points: number
          reward_bonus_percent: number
          sort_order: number
          waitlist_priority: number
        }
        Insert: {
          daily_priority_reservations?: number
          early_access_hours?: number
          level: Database["public"]["Enums"]["membership_level"]
          min_qualifying_points: number
          reward_bonus_percent?: number
          sort_order: number
          waitlist_priority: number
        }
        Update: {
          daily_priority_reservations?: number
          early_access_hours?: number
          level?: Database["public"]["Enums"]["membership_level"]
          min_qualifying_points?: number
          reward_bonus_percent?: number
          sort_order?: number
          waitlist_priority?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          kind: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          expires_at: string | null
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string | null
          payment_code: string
          payment_number: number
          proof_path: string | null
          provider_fee: number
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          expires_at?: string | null
          external_reference?: string | null
          id?: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string | null
          payment_code: string
          payment_number?: number
          proof_path?: string | null
          provider_fee?: number
          provider_payload?: Json
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          expires_at?: string | null
          external_reference?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          member_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string | null
          payment_code?: string
          payment_number?: number
          proof_path?: string | null
          provider_fee?: number
          provider_payload?: Json
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      point_ledger: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          delta: number
          description: string | null
          id: string
          member_id: string
          payment_id: string | null
          qualifying_delta: number
          reason: Database["public"]["Enums"]["point_reason"]
          referral_id: string | null
          reward_id: string | null
          story_id: string | null
          story_reward_day: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delta: number
          description?: string | null
          id?: string
          member_id: string
          payment_id?: string | null
          qualifying_delta?: number
          reason: Database["public"]["Enums"]["point_reason"]
          referral_id?: string | null
          reward_id?: string | null
          story_id?: string | null
          story_reward_day?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delta?: number
          description?: string | null
          id?: string
          member_id?: string
          payment_id?: string | null
          qualifying_delta?: number
          reason?: Database["public"]["Enums"]["point_reason"]
          referral_id?: string | null
          reward_id?: string | null
          story_id?: string | null
          story_reward_day?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_ledger_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "point_ledger_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "point_ledger_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "point_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "member_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      push_devices: {
        Row: {
          active: boolean
          created_at: string
          expo_push_token: string
          id: string
          last_seen_at: string
          platform: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expo_push_token: string
          id?: string
          last_seen_at?: string
          platform?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expo_push_token?: string
          id?: string
          last_seen_at?: string
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          awarded_at: string
          created_at: string
          id: string
          referral_code: string
          referred_member_id: string
          referred_points: number
          referrer_id: string
          referrer_points: number
          revoked_at: string | null
          revoked_by: string | null
          status: string
        }
        Insert: {
          awarded_at?: string
          created_at?: string
          id?: string
          referral_code: string
          referred_member_id: string
          referred_points?: number
          referrer_id: string
          referrer_points?: number
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
        }
        Update: {
          awarded_at?: string
          created_at?: string
          id?: string
          referral_code?: string
          referred_member_id?: string
          referred_points?: number
          referrer_id?: string
          referrer_points?: number
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_member_id_fkey"
            columns: ["referred_member_id"]
            isOneToOne: true
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "referrals_referred_member_id_fkey"
            columns: ["referred_member_id"]
            isOneToOne: true
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "referrals_referred_member_id_fkey"
            columns: ["referred_member_id"]
            isOneToOne: true
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reward_catalog: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          min_transaction: number
          points_cost: number
          reward_type: string
          service_id: string | null
          sort_order: number
          title_id: string
          validity_days: number
          vehicle_category:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          voucher_amount: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          min_transaction?: number
          points_cost: number
          reward_type: string
          service_id?: string | null
          sort_order?: number
          title_id: string
          validity_days?: number
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          voucher_amount?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          min_transaction?: number
          points_cost?: number
          reward_type?: string
          service_id?: string | null
          sort_order?: number
          title_id?: string
          validity_days?: number
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          voucher_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_catalog_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          active: boolean
          amount: number | null
          created_at: string
          id: string
          price_label: string | null
          service_id: string
          vehicle_category:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Insert: {
          active?: boolean
          amount?: number | null
          created_at?: string
          id?: string
          price_label?: string | null
          service_id: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Update: {
          active?: boolean
          amount?: number | null
          created_at?: string
          id?: string
          price_label?: string | null
          service_id?: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          booking_enabled: boolean
          capacity_default: number
          code: string
          consultation_only: boolean
          created_at: string
          description_id: string | null
          duration_label: string | null
          duration_minutes: number | null
          home_service_whatsapp: boolean
          id: string
          minimum_deposit: number
          name_en: string | null
          name_id: string
          requires_deposit: boolean
          sort_order: number
          updated_at: string
          workshop_only: boolean
        }
        Insert: {
          active?: boolean
          booking_enabled?: boolean
          capacity_default?: number
          code: string
          consultation_only?: boolean
          created_at?: string
          description_id?: string | null
          duration_label?: string | null
          duration_minutes?: number | null
          home_service_whatsapp?: boolean
          id?: string
          minimum_deposit?: number
          name_en?: string | null
          name_id: string
          requires_deposit?: boolean
          sort_order?: number
          updated_at?: string
          workshop_only?: boolean
        }
        Update: {
          active?: boolean
          booking_enabled?: boolean
          capacity_default?: number
          code?: string
          consultation_only?: boolean
          created_at?: string
          description_id?: string | null
          duration_label?: string | null
          duration_minutes?: number | null
          home_service_whatsapp?: boolean
          id?: string
          minimum_deposit?: number
          name_en?: string | null
          name_id?: string
          requires_deposit?: boolean
          sort_order?: number
          updated_at?: string
          workshop_only?: boolean
        }
        Relationships: []
      }
      staff_access_allowlist: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          email: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          email: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          email?: string
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          email: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          email: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          email?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          delete_reason: string | null
          deleted_by: string | null
          expires_at: string
          fire_count: number
          heart_count: number
          id: string
          like_count: number
          media_path: string
          member_id: string
          status: string
          view_count: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          delete_reason?: string | null
          deleted_by?: string | null
          expires_at?: string
          fire_count?: number
          heart_count?: number
          id?: string
          like_count?: number
          media_path: string
          member_id: string
          status?: string
          view_count?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          delete_reason?: string | null
          deleted_by?: string | null
          expires_at?: string
          fire_count?: number
          heart_count?: number
          id?: string
          like_count?: number
          media_path?: string
          member_id?: string
          status?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "stories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "stories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      story_member_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_member_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_member_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_member_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "story_member_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_member_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_member_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string
          member_id: string
          reaction: Database["public"]["Enums"]["story_reaction_type"]
          story_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          member_id: string
          reaction: Database["public"]["Enums"]["story_reaction_type"]
          story_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          member_id?: string
          reaction?: Database["public"]["Enums"]["story_reaction_type"]
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "story_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "story_reports_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "member_membership_summary"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "member_point_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      member_membership_summary: {
        Row: {
          level: Database["public"]["Enums"]["membership_level"] | null
          member_id: string | null
          qualifying_points_12m: number | null
          reward_points: number | null
        }
        Relationships: []
      }
      member_point_balances: {
        Row: {
          member_id: string | null
          qualifying_points_12m: number | null
          reward_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_birthday_reward_to_booking: {
        Args: { p_booking_id: string }
        Returns: {
          amount: number
          booking_id: string | null
          created_at: string
          expires_at: string | null
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string | null
          payment_code: string
          payment_number: number
          proof_path: string | null
          provider_fee: number
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_member_reward_to_booking: {
        Args: { p_booking_id: string; p_member_reward_id: string }
        Returns: {
          amount: number
          booking_id: string | null
          created_at: string
          expires_at: string | null
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string | null
          payment_code: string
          payment_number: number
          proof_path: string | null
          provider_fee: number
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      available_booking_slots: {
        Args: { p_service_id: string }
        Returns: {
          access_mode: string
          available_capacity: number
          booked_count: number
          capacity: number
          ends_at: string
          id: string
          priority_only: boolean
          public_release_at: string
          service_id: string
          starts_at: string
        }[]
      }
      block_story_member: { Args: { p_member_id: string }; Returns: boolean }
      booking_payment_summary: {
        Args: { p_booking_id: string }
        Returns: {
          booking_id: string
          booking_status: Database["public"]["Enums"]["booking_status"]
          deposit_required: number
          fully_paid: boolean
          minimum_payment_now: number
          paid_total: number
          quoted_total: number
          remaining_balance: number
        }[]
      }
      cancel_member_booking: {
        Args: { p_booking_id: string }
        Returns: {
          booking_code: string
          booking_number: number
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_forfeited: boolean
          deposit_required: number
          id: string
          member_id: string
          no_show_at: string | null
          notes: string | null
          original_booking_id: string | null
          quoted_total: number
          reschedule_count: number
          service_id: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          treatment_started_at: string | null
          updated_at: string
          used_priority_access: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_manual_payment: {
        Args: {
          p_amount: number
          p_booking_id: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_notes?: string
          p_proof_path?: string
        }
        Returns: {
          amount: number
          booking_id: string | null
          created_at: string
          expires_at: string | null
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string | null
          payment_code: string
          payment_number: number
          proof_path: string | null
          provider_fee: number
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_member_booking: {
        Args: {
          p_notes?: string
          p_service_id: string
          p_slot_id: string
          p_vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          p_vehicle_type: string
        }
        Returns: {
          booking_code: string
          booking_number: number
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_forfeited: boolean
          deposit_required: number
          id: string
          member_id: string
          no_show_at: string | null
          notes: string | null
          original_booking_id: string | null
          quoted_total: number
          reschedule_count: number
          service_id: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          treatment_started_at: string | null
          updated_at: string
          used_priority_access: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_member_story: {
        Args: { p_caption?: string; p_media_path: string }
        Returns: {
          caption: string | null
          created_at: string
          delete_reason: string | null
          deleted_by: string | null
          expires_at: string
          fire_count: number
          heart_count: number
          id: string
          like_count: number
          media_path: string
          member_id: string
          status: string
          view_count: number
        }
        SetofOptions: {
          from: "*"
          to: "stories"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_my_story: {
        Args: { p_story_id: string }
        Returns: {
          caption: string | null
          created_at: string
          delete_reason: string | null
          deleted_by: string | null
          expires_at: string
          fire_count: number
          heart_count: number
          id: string
          like_count: number
          media_path: string
          member_id: string
          status: string
          view_count: number
        }
        SetofOptions: {
          from: "*"
          to: "stories"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_story_view: { Args: { p_story_id: string }; Returns: boolean }
      redeem_reward: {
        Args: { p_reward_catalog_id: string }
        Returns: {
          benefit_template_id: string | null
          booking_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          member_id: string
          points_spent: number
          reward_catalog_id: string | null
          source: string
          status: string
          used_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "member_rewards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      report_story: {
        Args: { p_reason: string; p_story_id: string }
        Returns: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          story_id: string
        }
        SetofOptions: {
          from: "*"
          to: "story_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reschedule_member_booking: {
        Args: { p_booking_id: string; p_new_slot_id: string }
        Returns: {
          booking_code: string
          booking_number: number
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_forfeited: boolean
          deposit_required: number
          id: string
          member_id: string
          no_show_at: string | null
          notes: string | null
          original_booking_id: string | null
          quoted_total: number
          reschedule_count: number
          service_id: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          treatment_started_at: string | null
          updated_at: string
          used_priority_access: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_story_reaction: {
        Args: { p_reaction: string; p_story_id: string }
        Returns: string
      }
      staff_update_booking_status: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: {
          booking_code: string
          booking_number: number
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deposit_forfeited: boolean
          deposit_required: number
          id: string
          member_id: string
          no_show_at: string | null
          notes: string | null
          original_booking_id: string | null
          quoted_total: number
          reschedule_count: number
          service_id: string
          slot_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          treatment_started_at: string | null
          updated_at: string
          used_priority_access: boolean
          vehicle_category: Database["public"]["Enums"]["vehicle_category"]
          vehicle_type: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      staff_verify_manual_payment: {
        Args: { p_approved: boolean; p_notes?: string; p_payment_id: string }
        Returns: {
          amount: number
          booking_id: string | null
          created_at: string
          expires_at: string | null
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string | null
          payment_code: string
          payment_number: number
          proof_path: string | null
          provider_fee: number
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_my_birthday_reward: {
        Args: never
        Returns: {
          booking_id: string | null
          created_at: string
          expires_on: string
          id: string
          member_id: string
          reward_year: number
          starts_on: string
          status: string
          used_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "birthday_rewards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_my_membership_rewards: { Args: never; Returns: number }
      sync_story_expirations: { Args: never; Returns: number }
      unblock_story_member: { Args: { p_member_id: string }; Returns: boolean }
      update_my_member_profile: {
        Args: {
          p_avatar_path: string
          p_birth_date: string
          p_full_name: string
          p_marketing_notifications: boolean
        }
        Returns: {
          activated_at: string | null
          avatar_path: string | null
          birth_date: string
          birth_date_edit_count: number
          created_at: string
          email: string
          full_name: string
          marketing_notifications: boolean
          member_code: string
          member_number: number
          onboarding_completed: boolean
          referral_code: string
          referred_by: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
          username: string
        }
        SetofOptions: {
          from: "*"
          to: "member_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      booking_status:
        | "awaiting_payment"
        | "confirmed"
        | "late"
        | "no_show"
        | "in_treatment"
        | "completed"
        | "cancelled"
      member_status: "registered" | "active" | "suspended" | "deleted"
      membership_level: "classic" | "silver" | "gold" | "platinum"
      payment_kind:
        | "deposit"
        | "partial"
        | "final"
        | "full"
        | "refund"
        | "reward"
      payment_method:
        | "duitku_qris"
        | "duitku_va"
        | "duitku_ewallet"
        | "qris_bri_manual"
        | "bank_transfer_bri"
        | "cash"
        | "points"
      payment_status:
        | "pending"
        | "waiting_verification"
        | "paid"
        | "failed"
        | "expired"
        | "refunded"
      point_reason:
        | "transaction_base"
        | "membership_bonus"
        | "story_daily"
        | "referral_referrer"
        | "referral_new_member"
        | "redemption"
        | "admin_adjustment"
      staff_role: "owner_admin" | "cashier_technician"
      story_reaction_type: "heart" | "fire" | "like"
      vehicle_category: "small" | "medium" | "large" | "big_bike" | "luxury"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booking_status: [
        "awaiting_payment",
        "confirmed",
        "late",
        "no_show",
        "in_treatment",
        "completed",
        "cancelled",
      ],
      member_status: ["registered", "active", "suspended", "deleted"],
      membership_level: ["classic", "silver", "gold", "platinum"],
      payment_kind: ["deposit", "partial", "final", "full", "refund", "reward"],
      payment_method: [
        "duitku_qris",
        "duitku_va",
        "duitku_ewallet",
        "qris_bri_manual",
        "bank_transfer_bri",
        "cash",
        "points",
      ],
      payment_status: [
        "pending",
        "waiting_verification",
        "paid",
        "failed",
        "expired",
        "refunded",
      ],
      point_reason: [
        "transaction_base",
        "membership_bonus",
        "story_daily",
        "referral_referrer",
        "referral_new_member",
        "redemption",
        "admin_adjustment",
      ],
      staff_role: ["owner_admin", "cashier_technician"],
      story_reaction_type: ["heart", "fire", "like"],
      vehicle_category: ["small", "medium", "large", "big_bike", "luxury"],
    },
  },
} as const
