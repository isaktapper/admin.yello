export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          plan: string // 'free' | 'unlimited' men kan vara text
          created_at?: string | null
          updated_at?: string | null
          admin?: boolean | null
          display_name?: string | null
          email?: string | null
        }
        Insert: {
          id: string
          plan?: string
          created_at?: string | null
          updated_at?: string | null
          admin?: boolean | null
          display_name?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          plan?: string
          created_at?: string | null
          updated_at?: string | null
          admin?: boolean | null
          display_name?: string | null
          email?: string | null
        }
      }
      announcements: {
        Row: {
          id: string
          user_id?: string | null
          icon?: string | null
          background: string
          background_gradient?: string | null
          text_color: string
          visibility: boolean
          slug: string
          created_at?: string | null
          is_sticky: boolean
          title_font_size: number
          message_font_size: number
          text_alignment: string
          icon_alignment: string
          is_closable: boolean
          type: string
          type_settings?: Json | null
          content?: Json | null
          bar_height?: number | null
          use_gradient?: boolean | null
          font_family?: string | null
          geo_countries?: string[] | null
          page_paths?: string[] | null
          scheduledStart?: string | null
          scheduledEnd?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_text_color?: string | null
          cta_bg_color?: string | null
          cta_border_radius?: string | null
          cta_size?: string | null
          cta_enabled?: boolean | null
          cta_background_color?: string | null
          bar_name?: string | null
          allowed_domain?: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          icon?: string | null
          background?: string
          background_gradient?: string | null
          text_color?: string
          visibility?: boolean
          slug: string
          created_at?: string | null
          is_sticky?: boolean
          title_font_size?: number
          message_font_size?: number
          text_alignment?: string
          icon_alignment?: string
          is_closable?: boolean
          type?: string
          type_settings?: Json | null
          content?: Json | null
          bar_height?: number | null
          use_gradient?: boolean | null
          font_family?: string | null
          geo_countries?: string[] | null
          page_paths?: string[] | null
          scheduledStart?: string | null
          scheduledEnd?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_text_color?: string | null
          cta_bg_color?: string | null
          cta_border_radius?: string | null
          cta_size?: string | null
          cta_enabled?: boolean | null
          cta_background_color?: string | null
          bar_name?: string | null
          allowed_domain?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          icon?: string | null
          background?: string
          background_gradient?: string | null
          text_color?: string
          visibility?: boolean
          slug?: string
          created_at?: string | null
          is_sticky?: boolean
          title_font_size?: number
          message_font_size?: number
          text_alignment?: string
          icon_alignment?: string
          is_closable?: boolean
          type?: string
          type_settings?: Json | null
          content?: Json | null
          bar_height?: number | null
          use_gradient?: boolean | null
          font_family?: string | null
          geo_countries?: string[] | null
          page_paths?: string[] | null
          scheduledStart?: string | null
          scheduledEnd?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_text_color?: string | null
          cta_bg_color?: string | null
          cta_border_radius?: string | null
          cta_size?: string | null
          cta_enabled?: boolean | null
          cta_background_color?: string | null
          bar_name?: string | null
          allowed_domain?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
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