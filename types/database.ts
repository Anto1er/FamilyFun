export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          role: 'parent' | 'child';
          avatar_url: string | null;
          family_id: string | null;
          points_balance: number;
          expo_push_token: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          role: 'parent' | 'child';
          avatar_url?: string | null;
          family_id?: string | null;
          points_balance?: number;
          expo_push_token?: string | null;
          locale?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      families: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['families']['Insert']>;
      };
      missions: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          title: string;
          description: string | null;
          points_reward: number;
          recurrence: 'one_time' | 'daily' | 'weekly';
          status: 'active' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          points_reward: number;
          recurrence?: 'one_time' | 'daily' | 'weekly';
          status?: 'active' | 'archived';
        };
        Update: Partial<Database['public']['Tables']['missions']['Insert']>;
      };
      gifts: {
        Row: {
          id: string;
          family_id: string;
          child_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          link_url: string | null;
          points_cost: number | null;
          status: 'pending_approval' | 'approved' | 'rejected' | 'redeemed';
          approved_by: string | null;
          redeemed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          child_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          points_cost?: number | null;
          status?: 'pending_approval' | 'approved' | 'rejected' | 'redeemed';
          approved_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['gifts']['Insert']>;
      };
      mission_submissions: {
        Row: {
          id: string;
          mission_id: string;
          child_id: string;
          family_id: string;
          status: 'pending' | 'approved' | 'rejected';
          note: string | null;
          validated_by: string | null;
          validated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mission_id: string;
          child_id: string;
          family_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          note?: string | null;
          validated_by?: string | null;
          validated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['mission_submissions']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          family_id: string;
          child_id: string;
          amount: number;
          type: 'mission_reward' | 'gift_redemption' | 'manual_adjustment';
          reference_id: string | null;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          child_id: string;
          amount: number;
          type: 'mission_reward' | 'gift_redemption' | 'manual_adjustment';
          reference_id?: string | null;
          description: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          family_id: string;
          type: string;
          title: string;
          body: string;
          data: Json;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          family_id: string;
          type: string;
          title: string;
          body: string;
          data?: Json;
          read?: boolean;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}
