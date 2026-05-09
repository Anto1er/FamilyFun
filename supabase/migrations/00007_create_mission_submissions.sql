-- supabase/migrations/00007_create_mission_submissions.sql
create type submission_status as enum ('pending', 'approved', 'rejected');
create table mission_submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  child_id uuid not null references profiles(id),
  family_id uuid not null references families(id) on delete cascade,
  status submission_status not null default 'pending',
  note text,
  validated_by uuid references profiles(id),
  validated_at timestamptz,
  created_at timestamptz not null default now()
);
-- Function: when submission approved, credit points
create or replace function on_submission_approved() returns trigger as $$
declare mission_points integer;
mission_title text;
begin if new.status = 'approved'
and old.status = 'pending' then
select points_reward,
  title into mission_points,
  mission_title
from missions
where id = new.mission_id;
update profiles
set points_balance = points_balance + mission_points
where id = new.child_id;
insert into transactions (
    family_id,
    child_id,
    amount,
    type,
    reference_id,
    description
  )
values (
    new.family_id,
    new.child_id,
    mission_points,
    'mission_reward',
    new.id,
    mission_title
  );
end if;
return new;
end;
$$ language plpgsql security definer;
create trigger trg_submission_approved
after
update on mission_submissions for each row execute function on_submission_approved();
-- Function: when gift redeemed, debit points
create or replace function on_gift_redeemed() returns trigger as $$ begin if new.status = 'redeemed'
  and old.status = 'approved' then if (
    select points_balance
    from profiles
    where id = new.child_id
  ) < new.points_cost then raise exception 'Insufficient points balance';
end if;
update profiles
set points_balance = points_balance - new.points_cost
where id = new.child_id;
insert into transactions (
    family_id,
    child_id,
    amount,
    type,
    reference_id,
    description
  )
values (
    new.family_id,
    new.child_id,
    - new.points_cost,
    'gift_redemption',
    new.id,
    new.title
  );
new.redeemed_at = now();
end if;
return new;
end;
$$ language plpgsql security definer;
create trigger trg_gift_redeemed before
update on gifts for each row execute function on_gift_redeemed();