-- supabase/migrations/00003_create_missions.sql
create type mission_recurrence as enum ('one_time', 'daily', 'weekly');
create type mission_status as enum ('active', 'archived');
create table missions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text not null,
  description text,
  points_reward integer not null check (points_reward > 0),
  recurrence mission_recurrence not null default 'one_time',
  status mission_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger missions_updated_at before
update on missions for each row execute function update_updated_at();