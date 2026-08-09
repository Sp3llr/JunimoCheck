drop function if exists public.accept_farm_invite(uuid);

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.add_owner_membership() from public, anon, authenticated;
revoke all on function public.touch_farm() from public, anon, authenticated;

grant usage on schema private to postgres, service_role;
