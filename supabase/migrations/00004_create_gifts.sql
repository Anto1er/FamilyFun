-- supabase/migrations/00004_create_gifts.sql
create type gift_status as enum (
  'pending_approval',
  'approved',
  'rejected',
  'redeemed'
);
create table gifts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references profiles(id),
  title text not null,
  description text,
  image_url text,
  link_url text,
  points_cost integer,
  status gift_status not null default 'pending_approval',
  approved_by uuid references profiles(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger gifts_updated_at before
update on gifts for each row execute function update_updated_at();