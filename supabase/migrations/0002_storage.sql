-- ================================================================
-- Storage バケットとアクセスポリシー
-- ================================================================
-- profile-photos : プロフィール写真。本人のみアップロード、ログイン済みなら閲覧可
-- student-ids    : 学生証画像。本人のみアップロード、クライアントからの閲覧は一切不可
--                  （運営は Supabase ダッシュボード = service_role で閲覧する）
--
-- パス規約: 必ず「{自分のuser_id}/ファイル名」で保存する。
--           ポリシーが先頭フォルダ名 = 自分のUUID であることを強制する。
-- ================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880,  -- 5MB
   array['image/jpeg', 'image/png', 'image/webp']),
  ('student-ids',    'student-ids',    false, 10485760, -- 10MB
   array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- ----------------------------------------------------------------
-- profile-photos
-- ----------------------------------------------------------------

-- 閲覧: ログイン済みユーザーなら誰の写真でも可
-- （ブロック相手の除外は photos テーブルの RLS で行が見えない時点で
--   パスが取得できないため、実質的に到達不能）
create policy "photos_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos');

-- アップロード/更新/削除: 自分のフォルダのみ
create policy "photos_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_replace" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_remove" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------
-- student-ids
-- ----------------------------------------------------------------

-- アップロードのみ許可。SELECT ポリシーを意図的に作らない =
-- 本人を含め、クライアントからは誰も読めない（運営のみ閲覧可）

create policy "student_id_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-ids'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
