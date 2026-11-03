-- ================================================================
-- 富山大学生マッチングアプリ MVP - 初期スキーマ
-- ================================================================
-- 設計の根拠: アプリ_social/Phase4_技術スタック選定/3_DB・インフラ/ワークシート.txt
-- スコープ  : 相互いいね → マッチ → チャット（課金・通知は対象外）
--
-- 適用方法は supabase/README.md を参照。
-- ================================================================

-- ----------------------------------------------------------------
-- 0. 共通: enum 定義
-- ----------------------------------------------------------------

create type public.gender as enum ('male', 'female', 'other');

-- いいね or スキップ（スキップも記録して同じ人を再表示しないため）
create type public.like_action as enum ('like', 'pass');

-- 本人確認（学生証）の審査状態。MVPでは Supabase ダッシュボードから手動で更新する
create type public.verification_status as enum ('pending', 'approved', 'rejected');

create type public.report_reason as enum (
  'fake_profile',      -- なりすまし・虚偽プロフィール
  'harassment',        -- 誹謗中傷・嫌がらせ
  'inappropriate',     -- わいせつ・不適切な内容
  'solicitation',      -- 勧誘（ビジネス・宗教・売春等）
  'underage',          -- 18歳未満の疑い
  'other'
);

-- ----------------------------------------------------------------
-- 1. 大学メールドメイン許可リスト
-- ----------------------------------------------------------------
-- ⚠️ 要確認: ドメインは仮です。各大学の公式サイトで「学生に発行される
--    メールアドレスのドメイン」を必ず確認してから本番投入すること。
--    （在学生に実物を見せてもらうのが一番確実）

create table public.allowed_email_domains (
  domain      text primary key,           -- 例: 'u-toyama.ac.jp'
  university  text not null,              -- 大学名（表示用）
  note        text                        -- サブドメイン有無などのメモ
);

comment on table public.allowed_email_domains is
  '登録を許可する大学メールドメイン。富山県内の大学のみ。';

-- ----------------------------------------------------------------
-- 2. プロフィール
-- ----------------------------------------------------------------
-- ユーザー本体は Supabase Auth (auth.users) が管理する。
-- パスワードはこちらでは一切扱わない。

create table public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  nickname     text not null check (char_length(nickname) between 1 and 20),
  birthdate    date not null,
  gender       public.gender not null,
  looking_for  public.gender[] not null check (cardinality(looking_for) > 0),
                                       -- 「探している相手の性別」(Phase1で決めた必須項目)
  university   text not null,           -- 大学名（表示用）
  department   text,                    -- 学部・専攻
  grade        smallint check (grade between 1 and 6),
  bio          text check (char_length(bio) <= 500),
  hobbies      text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- 18歳未満は登録不可（生年月日ベース。自己申告の年齢数値は使わない）
  constraint adult_only check (birthdate <= (current_date - interval '18 years'))
);

-- ----------------------------------------------------------------
-- 3. プロフィール写真
-- ----------------------------------------------------------------
-- 実体は Storage の profile-photos バケットに置き、ここにはパスだけ保存する。
-- base64 を DB に入れることは禁止（旧デモの反省点）。

create table public.photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (user_id) on delete cascade,
  storage_path text not null,            -- 例: '{user_id}/1.jpg'
  sort_order   smallint not null default 0,
  is_main      boolean not null default false,
  created_at   timestamptz not null default now(),

  unique (user_id, sort_order)
);

-- 1人あたり最大6枚（Phase3ワークシート: 最大6枚・最低2枚）
create or replace function public.check_photo_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.photos where user_id = new.user_id) >= 6 then
    raise exception '写真は最大6枚までです';
  end if;
  return new;
end;
$$;

create trigger photos_limit
  before insert on public.photos
  for each row execute function public.check_photo_limit();

-- ----------------------------------------------------------------
-- 4. いいね / スキップ
-- ----------------------------------------------------------------

create table public.likes (
  id           uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (user_id) on delete cascade,
  to_user_id   uuid not null references public.profiles (user_id) on delete cascade,
  action       public.like_action not null,
  created_at   timestamptz not null default now(),

  unique (from_user_id, to_user_id),     -- 同じ相手への二重いいね防止
  check (from_user_id <> to_user_id)     -- 自分自身へのいいね防止
);

create index likes_to_user_idx on public.likes (to_user_id) where action = 'like';

-- ----------------------------------------------------------------
-- 5. マッチ
-- ----------------------------------------------------------------
-- 相互いいねが成立した瞬間にトリガーが自動作成する。
-- アプリ側から直接 INSERT させない（即マッチだった旧デモの反省点）。
-- user1_id < user2_id に正規化して重複マッチを構造的に防ぐ。

create table public.matches (
  id         uuid primary key default gen_random_uuid(),
  user1_id   uuid not null references public.profiles (user_id) on delete cascade,
  user2_id   uuid not null references public.profiles (user_id) on delete cascade,
  matched_at timestamptz not null default now(),

  unique (user1_id, user2_id),
  check (user1_id < user2_id)
);

-- 相互いいね判定トリガー
create or replace function public.handle_mutual_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.action = 'like' and exists (
    select 1 from public.likes
    where from_user_id = new.to_user_id
      and to_user_id   = new.from_user_id
      and action = 'like'
  ) then
    insert into public.matches (user1_id, user2_id)
    values (
      least(new.from_user_id, new.to_user_id),
      greatest(new.from_user_id, new.to_user_id)
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger likes_mutual_check
  after insert on public.likes
  for each row execute function public.handle_mutual_like();

-- ----------------------------------------------------------------
-- 6. メッセージ
-- ----------------------------------------------------------------

create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender_id  uuid not null references public.profiles (user_id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  sent_at    timestamptz not null default now()
);

create index messages_match_idx on public.messages (match_id, sent_at);

-- ----------------------------------------------------------------
-- 7. ブロック
-- ----------------------------------------------------------------

create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles (user_id) on delete cascade,
  blocked_id  uuid not null references public.profiles (user_id) on delete cascade,
  created_at  timestamptz not null default now(),

  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- どちらか一方がブロックしていれば true（双方向非表示の判定に使う）
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- ----------------------------------------------------------------
-- 8. 通報
-- ----------------------------------------------------------------
-- 通報内容は運営のみ閲覧（クライアントには読み取りポリシーを与えない。
-- 運営は Supabase ダッシュボード = service_role 経由で見る）。

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (user_id) on delete cascade,
  target_id   uuid not null references public.profiles (user_id) on delete cascade,
  reason      public.report_reason not null,
  detail      text check (char_length(detail) <= 1000),
  created_at  timestamptz not null default now(),

  check (reporter_id <> target_id)
);

-- ----------------------------------------------------------------
-- 9. 本人確認（学生証）
-- ----------------------------------------------------------------
-- 画像の実体は Storage の student-ids バケット（運営のみ閲覧可）。
-- 審査は MVP では Supabase ダッシュボードから status を手動更新する。

create table public.verifications (
  user_id      uuid primary key references public.profiles (user_id) on delete cascade,
  storage_path text not null,
  status       public.verification_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  reject_note  text                       -- 否認理由（本人に表示する文言）
);

-- ----------------------------------------------------------------
-- 10. 大学メール以外の登録をブロック（Auth トリガー）
-- ----------------------------------------------------------------

create or replace function public.enforce_university_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_email_domains d
    where lower(new.email) like '%@' || lower(d.domain)
  ) then
    raise exception '富山県内の大学メールアドレスのみ登録できます';
  end if;
  return new;
end;
$$;

create trigger enforce_university_email
  before insert on auth.users
  for each row execute function public.enforce_university_email();

-- ----------------------------------------------------------------
-- 11. 候補取得 RPC（スワイプ画面用）
-- ----------------------------------------------------------------
-- 条件:
--   - 自分以外
--   - 性別の希望が双方向に一致（相手が自分の looking_for に含まれ、
--     自分が相手の looking_for に含まれる）← 旧デモの非対称ハードコードを廃止
--   - ブロック関係にない（双方向）
--   - まだ いいね/スキップ していない相手

create or replace function public.get_candidates(limit_count int default 20)
returns setof public.profiles
language sql
stable
security definer set search_path = public
as $$
  select p.*
  from public.profiles p
  join public.profiles me on me.user_id = auth.uid()
  where p.user_id <> auth.uid()
    and p.gender  = any (me.looking_for)
    and me.gender = any (p.looking_for)
    and not public.is_blocked(auth.uid(), p.user_id)
    and not exists (
      select 1 from public.likes l
      where l.from_user_id = auth.uid() and l.to_user_id = p.user_id
    )
  order by p.created_at desc
  limit limit_count;
$$;

-- ----------------------------------------------------------------
-- 12. updated_at 自動更新
-- ----------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ================================================================
-- 13. RLS（行レベルセキュリティ）
-- ================================================================
-- 方針: 「全テーブル RLS 有効・デフォルト拒否・必要な操作だけ許可」
-- 旧デモの重大欠陥（誰でも全データ読み書き可）をここで構造的に潰す。

alter table public.allowed_email_domains enable row level security;
alter table public.profiles              enable row level security;
alter table public.photos                enable row level security;
alter table public.likes                 enable row level security;
alter table public.matches               enable row level security;
alter table public.messages              enable row level security;
alter table public.blocks                enable row level security;
alter table public.reports               enable row level security;
alter table public.verifications         enable row level security;

-- --- allowed_email_domains: 全員読み取り可（登録画面の案内用）、書き込みは運営のみ ---
create policy domains_read on public.allowed_email_domains
  for select to authenticated, anon using (true);

-- --- profiles ---
-- 読み取り: ログイン済みユーザーは、ブロック関係にない相手のプロフィールを閲覧可
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or not public.is_blocked(auth.uid(), user_id)
  );

-- 書き込み: 自分の行のみ
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy profiles_update on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (user_id = auth.uid());

-- --- photos ---
create policy photos_select on public.photos
  for select to authenticated
  using (
    user_id = auth.uid()
    or not public.is_blocked(auth.uid(), user_id)
  );

create policy photos_write on public.photos
  for insert to authenticated
  with check (user_id = auth.uid());

create policy photos_update on public.photos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy photos_delete on public.photos
  for delete to authenticated
  using (user_id = auth.uid());

-- --- likes ---
-- 送信: 自分発のみ。ブロック相手には送れない
create policy likes_insert on public.likes
  for insert to authenticated
  with check (
    from_user_id = auth.uid()
    and not public.is_blocked(from_user_id, to_user_id)
  );

-- 閲覧: 自分が送ったもの + 自分宛ての「いいね」（いいね一覧画面 S09 用。
-- 相手の pass（スキップされた事実）は見えない）
create policy likes_select on public.likes
  for select to authenticated
  using (
    from_user_id = auth.uid()
    or (to_user_id = auth.uid() and action = 'like')
  );

-- --- matches ---
-- 作成はトリガー（security definer）のみ。クライアントは閲覧だけ
create policy matches_select on public.matches
  for select to authenticated
  using (auth.uid() in (user1_id, user2_id));

-- --- messages ---
-- 閲覧: 自分が当事者のマッチのみ
create policy messages_select on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and auth.uid() in (m.user1_id, m.user2_id)
    )
  );

-- 送信: 自分のマッチ宛て + 送信者は自分 + ブロック関係にない
--
-- ⚠️ TODO(クローズドβ公開前に必ず戻す):
--    本来のフロー定義は「学生認証済みでチャット可能」。テスト中は審査の手間を
--    省くため本人確認チェックを外している。公開前に下の条件を with check に
--    追加すること:
--
--      and exists (
--        select 1 from public.verifications v
--        where v.user_id = auth.uid() and v.status = 'approved'
--      )
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and auth.uid() in (m.user1_id, m.user2_id)
        and not public.is_blocked(m.user1_id, m.user2_id)
    )
  );

-- --- blocks ---
create policy blocks_select on public.blocks
  for select to authenticated
  using (blocker_id = auth.uid());

create policy blocks_insert on public.blocks
  for insert to authenticated
  with check (blocker_id = auth.uid());

create policy blocks_delete on public.blocks
  for delete to authenticated
  using (blocker_id = auth.uid());

-- --- reports ---
-- 送信のみ可。読み取りポリシーは意図的に作らない（運営のみ閲覧）
create policy reports_insert on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

-- --- verifications ---
-- 自分の審査状態のみ閲覧・提出可。status の更新は運営（service_role）のみ
create policy verifications_select on public.verifications
  for select to authenticated
  using (user_id = auth.uid());

create policy verifications_insert on public.verifications
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

-- ----------------------------------------------------------------
-- 14. Realtime（チャット用）
-- ----------------------------------------------------------------
-- messages の INSERT を購読できるようにする（RLS が購読にも適用される）

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
