-- Allow direct validation from claimed status (parent validates without child completing)
create or replace function on_submission_approved() returns trigger as $$
declare mission_points integer;
mission_title text;
begin if new.status = 'approved'
and (
  old.status = 'pending'
  or old.status = 'claimed'
) then
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