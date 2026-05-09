-- supabase/migrations/00005_create_transactions.sql
create type transaction_type as enum (
  'mission_reward',
  'gift_redemption',
  'manual_adjustment'
);
create table transactions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references profiles(id),
  amount integer not null,
  type transaction_type not null,
  reference_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);