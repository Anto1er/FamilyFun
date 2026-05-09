-- supabase/migrations/00008_rls_policies.sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table families enable row level security;
alter table missions enable row level security;
alter table gifts enable row level security;
alter table transactions enable row level security;
alter table notifications enable row level security;
alter table mission_submissions enable row level security;
-- PROFILES
create policy "Users can view own profile" on profiles for
select using (auth.uid() = id);
create policy "Users can view family members" on profiles for
select using (
    family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Users can update own profile" on profiles for
update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for
insert with check (auth.uid() = id);
-- FAMILIES
create policy "Family members can view their family" on families for
select using (
    id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Anyone can view family by invite code" on families for
select using (true);
create policy "Authenticated users can create families" on families for
insert with check (auth.uid() = created_by);
-- MISSIONS
create policy "Family members can view missions" on missions for
select using (
    family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Parents can create missions" on missions for
insert with check (
    exists(
      select 1
      from profiles
      where id = auth.uid()
        and role = 'parent'
    )
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Parents can update missions" on missions for
update using (
    exists(
      select 1
      from profiles
      where id = auth.uid()
        and role = 'parent'
    )
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
-- GIFTS
create policy "Family members can view gifts" on gifts for
select using (
    family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Children can insert gifts" on gifts for
insert with check (
    auth.uid() = child_id
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Parents can update gifts" on gifts for
update using (
    exists(
      select 1
      from profiles
      where id = auth.uid()
        and role = 'parent'
    )
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Children can update own gifts for redemption" on gifts for
update using (
    auth.uid() = child_id
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
-- MISSION SUBMISSIONS
create policy "Family members can view submissions" on mission_submissions for
select using (
    family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Children can submit missions" on mission_submissions for
insert with check (
    auth.uid() = child_id
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
create policy "Parents can validate submissions" on mission_submissions for
update using (
    exists(
      select 1
      from profiles
      where id = auth.uid()
        and role = 'parent'
    )
    and family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
-- TRANSACTIONS
create policy "Family members can view transactions" on transactions for
select using (
    family_id in (
      select family_id
      from profiles
      where id = auth.uid()
    )
  );
-- NOTIFICATIONS
create policy "Users can view own notifications" on notifications for
select using (auth.uid() = recipient_id);
create policy "Users can update own notifications" on notifications for
update using (auth.uid() = recipient_id);
-- Allow system inserts for notifications (via triggers/functions)
create policy "System can insert notifications" on notifications for
insert with check (true);