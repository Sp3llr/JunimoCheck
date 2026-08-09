create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 60),
  checklist_title text not null default 'Checklist da Fazenda' check (char_length(trim(checklist_title)) between 2 and 70),
  description text not null default '' check (char_length(description) <= 280),
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.farm_members (
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (farm_id, user_id)
);

create table if not exists public.farm_invites (
  token uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  email text not null,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  unique (farm_id, email)
);

create table if not exists public.farm_progress (
  farm_id uuid not null references public.farms(id) on delete cascade,
  entry_id text not null,
  completed_at timestamptz not null default now(),
  completed_by uuid references public.profiles(id) on delete set null,
  primary key (farm_id, entry_id)
);

create index if not exists farm_members_user_id_idx on public.farm_members(user_id);
create index if not exists farm_progress_farm_id_idx on public.farm_progress(farm_id);
create index if not exists farm_invites_email_idx on public.farm_invites(lower(email));

create or replace function private.is_farm_member(target_farm_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = target_farm_id and user_id = (select auth.uid())
  );
$$;

create or replace function private.is_farm_owner(target_farm_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = target_farm_id and user_id = (select auth.uid()) and role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.add_owner_membership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.farm_members (farm_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_farm_created on public.farms;
create trigger on_farm_created
  after insert on public.farms for each row execute procedure public.add_owner_membership();

create or replace function public.touch_farm()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_farm_updated on public.farms;
create trigger on_farm_updated before update on public.farms for each row execute procedure public.touch_farm();

create or replace function public.accept_farm_invite(invite_token uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  invite_row public.farm_invites;
  current_email text;
begin
  if auth.uid() is null then raise exception 'Faça login para aceitar o convite'; end if;
  select email into current_email from auth.users where id = auth.uid();
  select * into invite_row from public.farm_invites
  where token = invite_token and accepted_at is null and expires_at > now()
    and lower(email) = lower(current_email)
  for update;
  if not found then raise exception 'Convite inválido, expirado ou destinado a outro e-mail'; end if;
  insert into public.farm_members (farm_id, user_id, role)
  values (invite_row.farm_id, auth.uid(), 'member') on conflict do nothing;
  update public.farm_invites set accepted_at = now() where token = invite_token;
  return invite_row.farm_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_members enable row level security;
alter table public.farm_invites enable row level security;
alter table public.farm_progress enable row level security;

create policy "profile owner can read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile owner can update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "members can read farms" on public.farms for select to authenticated using (private.is_farm_member(id));
create policy "users create farms" on public.farms for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owners update farms" on public.farms for update to authenticated using (private.is_farm_owner(id)) with check ((select auth.uid()) = owner_id);
create policy "owners delete farms" on public.farms for delete to authenticated using (private.is_farm_owner(id));

create policy "members view roster" on public.farm_members for select to authenticated using (private.is_farm_member(farm_id));

create policy "members view progress" on public.farm_progress for select to authenticated using (private.is_farm_member(farm_id));
create policy "members add progress" on public.farm_progress for insert to authenticated with check (private.is_farm_member(farm_id) and (completed_by is null or completed_by = (select auth.uid())));
create policy "members update progress" on public.farm_progress for update to authenticated using (private.is_farm_member(farm_id)) with check (private.is_farm_member(farm_id));
create policy "members delete progress" on public.farm_progress for delete to authenticated using (private.is_farm_member(farm_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('farm-logos', 'farm-logos', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "anyone sees farm logos" on storage.objects for select using (bucket_id = 'farm-logos');
create policy "users upload their logos" on storage.objects for insert to authenticated with check (bucket_id = 'farm-logos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "users replace their logos" on storage.objects for update to authenticated using (bucket_id = 'farm-logos' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'farm-logos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "users delete their logos" on storage.objects for delete to authenticated using (bucket_id = 'farm-logos' and (storage.foldername(name))[1] = (select auth.uid()::text));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.farms, public.farm_members, public.farm_progress to authenticated;
grant execute on function public.accept_farm_invite(uuid) to authenticated;
