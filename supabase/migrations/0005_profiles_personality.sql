alter table public.profiles
  add column if not exists personality text[] not null default '{}';
