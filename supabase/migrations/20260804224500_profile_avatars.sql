alter table public.profiles add column if not exists avatar_key text not null default 'abigail';

alter table public.profiles drop constraint if exists profiles_avatar_key_check;
alter table public.profiles add constraint profiles_avatar_key_check
  check (avatar_key in ('abigail', 'sebastian', 'leah', 'sam', 'penny', 'shane'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_key)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_key', ''), 'abigail')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists "profile owner can read" on public.profiles;
create policy "farm members can read profiles" on public.profiles for select to authenticated using (
  id = (select auth.uid()) or exists (
    select 1
    from public.farm_members mine
    join public.farm_members teammate on teammate.farm_id = mine.farm_id
    where mine.user_id = (select auth.uid()) and teammate.user_id = profiles.id
  )
);
