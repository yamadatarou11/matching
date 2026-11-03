drop function if exists public.get_candidates(int);
drop function if exists public.get_profiles_public(uuid[]);

create or replace function public.get_candidates(limit_count int default 20)
returns table (
  user_id uuid,
  nickname text,
  age int,
  gender public.gender,
  university text,
  department text,
  grade smallint,
  hometown text,
  profile_type text,
  ideal_date text,
  bio text,
  hobbies text[],
  personality text[]
)
language sql
stable
security definer set search_path = public
as $$
  select
    p.user_id,
    p.nickname,
    date_part('year', age(p.birthdate))::int as age,
    p.gender,
    p.university,
    p.department,
    p.grade,
    p.hometown,
    p.profile_type,
    p.ideal_date,
    p.bio,
    p.hobbies,
    p.personality
  from public.profiles p
  join public.profiles me on me.user_id = auth.uid()
  where auth.uid() is not null
    and p.user_id <> auth.uid()
    and p.gender = any (me.looking_for)
    and me.gender = any (p.looking_for)
    and not public.is_blocked(auth.uid(), p.user_id)
    and not exists (
      select 1 from public.likes l
      where l.from_user_id = auth.uid() and l.to_user_id = p.user_id
    )
  order by p.created_at desc
  limit limit_count;
$$;

create or replace function public.get_profiles_public(user_ids uuid[])
returns table (
  user_id uuid,
  nickname text,
  age int,
  gender public.gender,
  university text,
  department text,
  grade smallint,
  hometown text,
  profile_type text,
  ideal_date text,
  bio text,
  hobbies text[],
  personality text[]
)
language sql
stable
security definer set search_path = public
as $$
  select
    p.user_id,
    p.nickname,
    date_part('year', age(p.birthdate))::int as age,
    p.gender,
    p.university,
    p.department,
    p.grade,
    p.hometown,
    p.profile_type,
    p.ideal_date,
    p.bio,
    p.hobbies,
    p.personality
  from public.profiles p
  where auth.uid() is not null
    and p.user_id = any (coalesce(user_ids, '{}'::uuid[]))
    and (p.user_id = auth.uid() or not public.is_blocked(auth.uid(), p.user_id))
  order by array_position(user_ids, p.user_id);
$$;

grant execute on function public.get_candidates(int) to authenticated;
grant execute on function public.get_profiles_public(uuid[]) to authenticated;
