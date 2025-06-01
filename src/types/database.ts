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
          created_at: string
          updated_at: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
        }
      }
      creators: {
        Row: {
          id: string
          status: string
          rating: number
          total_ratings: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          status?: string
          rating?: number
          total_ratings?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: string
          rating?: number
          total_ratings?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      call_products: {
        Row: {
          id: string
          creator_id: string
          type: string
          title: string
          description: string | null
          price: number
          duration: number
          recording_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          type: string
          title: string
          description?: string | null
          price: number
          duration: number
          recording_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          type?: string
          title?: string
          description?: string | null
          price?: number
          duration?: number
          recording_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          product_id: string
          creator_id: string
          status: string
          scheduled_start: string | null
          scheduled_end: string | null
          room_url: string | null
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          creator_id: string
          status?: string
          scheduled_start?: string | null
          scheduled_end?: string | null
          room_url?: string | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          creator_id?: string
          status?: string
          scheduled_start?: string | null
          scheduled_end?: string | null
          room_url?: string | null
          recording_url?: string | null
          created_at?: string
          updated_at?: string
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
  }
} 