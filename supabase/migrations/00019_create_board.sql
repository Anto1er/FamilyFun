create table boards (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references profiles(id) on delete cascade not null unique,
    items jsonb default '[]'::jsonb not null,
    updated_at timestamptz default now() not null
);
alter table boards enable row level security;
create policy "Family members can view boards" on boards for
select using (
        child_id in (
            select id
            from profiles
            where family_id = (
                    select family_id
                    from profiles
                    where id = auth.uid()
                )
        )
    );
create policy "Owner or parent can update boards" on boards for all using (
    child_id in (
        select id
        from profiles
        where family_id = (
                select family_id
                from profiles
                where id = auth.uid()
            )
    )
);