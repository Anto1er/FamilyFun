export type UserRole = 'parent' | 'child';

export type MissionRecurrence = 'one_time' | 'daily' | 'weekly';
export type MissionStatus = 'active' | 'archived';
export type GiftStatus = 'pending_approval' | 'approved' | 'rejected' | 'redeemed';
export type SubmissionStatus = 'claimed' | 'pending' | 'approved' | 'rejected';
export type TransactionType = 'mission_reward' | 'gift_redemption' | 'manual_adjustment';
export type NotificationType =
  | 'mission_available'
  | 'mission_claimed'
  | 'mission_submitted'
  | 'mission_validated'
  | 'mission_rejected'
  | 'gift_submitted'
  | 'gift_approved'
  | 'gift_rejected'
  | 'gift_redeemed'
  | 'points_earned';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url: string | null;
  family_id: string | null;
  points_balance: number;
  expo_push_token: string | null;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface Mission {
  id: string;
  family_id: string;
  created_by: string;
  title: string;
  description: string | null;
  points_reward: number;
  recurrence: MissionRecurrence;
  status: MissionStatus;
  created_at: string;
  updated_at: string;
}

export interface Gift {
  id: string;
  family_id: string;
  child_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  points_cost: number | null;
  status: GiftStatus;
  approved_by: string | null;
  redeemed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionSubmission {
  id: string;
  mission_id: string;
  child_id: string;
  family_id: string;
  status: SubmissionStatus;
  note: string | null;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  family_id: string;
  child_id: string;
  amount: number;
  type: TransactionType;
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  family_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}
