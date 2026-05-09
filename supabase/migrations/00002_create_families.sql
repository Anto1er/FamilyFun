-- supabase/migrations/00002_create_families.sql
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
alter table profiles
add constraint fk_profiles_family foreign key (family_id) references families(id);
create or replace function generate_invite_code() returns text as $$
declare code text;
exists_already boolean;
begin loop code := upper(substr(md5(random()::text), 1, 6));
select exists(
    select 1
    from families
    where invite_code = code
  ) into exists_already;
exit
when not exists_already;
end loop;
return code;
end;
$$ language plpgsql;