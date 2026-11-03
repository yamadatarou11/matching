alter table public.profiles
  add column if not exists hometown text,
  add column if not exists profile_type text,
  add column if not exists ideal_date text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_hometown_length') then
    alter table public.profiles
      add constraint profiles_hometown_length check (char_length(hometown) <= 80);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_profile_type_length') then
    alter table public.profiles
      add constraint profiles_profile_type_length check (char_length(profile_type) <= 100);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_ideal_date_length') then
    alter table public.profiles
      add constraint profiles_ideal_date_length check (char_length(ideal_date) <= 80);
  end if;
end $$;
