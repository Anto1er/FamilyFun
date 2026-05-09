-- supabase/migrations/00006_create_notifications.sql
create type notification_type as enum (
  'mission_submitted',
  'mission_validated',
  'mission_rejected',
  'gift_submitted',
  'gift_approved',
  'gift_rejected',
  'gift_redeemed',
  'points_earned'
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  data jsonb default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_recipient on notifications(recipient_id, read, created_at desc);