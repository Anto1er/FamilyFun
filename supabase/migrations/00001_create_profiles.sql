-- supabase/migrations/00001_create_profiles.sql
create type user_role as enum ('parent', 'child');
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role user_role not null,
  avatar_url text,
  family_id uuid,
  points_balance integer not null default 0,
  expo_push_token text,
  locale text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function update_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create trigger profiles_updated_at before
update on profiles for each row execute function update_updated_at();