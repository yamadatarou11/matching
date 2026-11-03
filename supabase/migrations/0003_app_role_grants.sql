-- ================================================================
-- App role privileges
-- ================================================================
-- RLS policies decide which rows are accessible, but the API roles
-- still need table/function privileges before those policies are used.

grant usage on schema public to anon, authenticated;

grant select on public.allowed_email_domains to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.photos to authenticated;

grant select, insert on public.likes to authenticated;
grant select on public.matches to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant insert on public.reports to authenticated;
grant select, insert on public.verifications to authenticated;

grant execute on function public.get_candidates(int) to authenticated;
