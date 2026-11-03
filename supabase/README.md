# supabase/ — データベース定義（MVP本番用）

富山県内大学生限定マッチングアプリのDBスキーマ・セキュリティルール一式。
`待ちあぷ/`（画面プロトタイプ）とは独立した、本番MVP用の土台です。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `migrations/0001_initial_schema.sql` | テーブル・トリガー・RLS（カギかけ）全部 |
| `migrations/0002_storage.sql` | 写真・学生証のStorageバケットとアクセス制御 |
| `migrations/0003_app_role_grants.sql` | アプリ用ロール（anon / authenticated）のDB操作権限 |
| `seed.sql` | 富山県内大学のメールドメイン許可リスト（**全件要確認の叩き台**） |

## 適用手順（初回）

1. [supabase.com](https://supabase.com) で新規プロジェクト作成（無料のFreeプランでOK）
2. ダッシュボードの **SQL Editor** を開く
3. `migrations/0001_initial_schema.sql` の中身を貼り付けて Run
4. `migrations/0002_storage.sql` も同様に Run
5. `migrations/0003_app_role_grants.sql` も同様に Run
6. `seed.sql` のドメインを**実際に確認してから**修正して Run
7. **Authentication → Providers → Email** で「Confirm email」を有効にする
   （メール認証コードでの登録に必要）

> 慣れてきたら Supabase CLI（`supabase db push`）での管理に移行すると
> マイグレーション履歴が残せます。最初はSQL Editorで十分。

## この設計で守られていること（旧デモの重大欠陥への対応）

| 旧デモの問題 | この設計での対策 |
|---|---|
| パスワードが全員に配布される | パスワードはSupabase Authだけが管理。こちらのDBには存在しない |
| 誰でも全データ読み書き可 | 全テーブルRLS有効・デフォルト拒否。「自分の行しか書けない」を強制 |
| いいねした瞬間に即マッチ | マッチはDBトリガーが「相互いいね」を確認して自動作成。アプリからは作れない |
| 写真base64で1MB制限超過 | 写真はStorage保存。DBにはパスのみ |
| 名前が主キーで同名事故 | 全テーブルUUIDで照合 |
| 富山限定がない | `allowed_email_domains` にない大学メールは登録自体が失敗する |

## 運営作業（MVPでは管理画面を作らずダッシュボードで行う）

- **学生証の審査**: Table Editor → `verifications` → 該当行の `status` を
  `approved` / `rejected` に変更。画像は Storage → `student-ids` で確認
- **通報の確認**: Table Editor → `reports`（クライアントからは誰も読めない設計）
- **強制退会**: Authentication → Users → 該当ユーザーを削除
  （profiles 以下は `on delete cascade` で連鎖削除される）

## アプリ側（app/）が使うAPI

- 候補取得: `supabase.rpc('get_candidates', { limit_count: 20 })`
- いいね/スキップ: `likes` に INSERT（マッチ成立はトリガー任せ）
- マッチ通知: `matches` のRealtime購読
- チャット: `messages` のRealtime購読 + INSERT
  （**本人確認が approved になるまで送信はRLSで拒否される**仕様）

## 残タスク（スキーマ確定後）

- [ ] **クローズドβ公開前**: チャット送信の「本人確認済みチェック」を有効に戻す
      （`0001_initial_schema.sql` の `messages_insert` ポリシー内の TODO コメント参照。
      テスト中は審査の手間を省くため意図的に外してある）
- [ ] `seed.sql` のドメイン全件を実物で確認（最重要・人間の仕事）
- [ ] 高専の「4年生以上のみ」を登録フローでどう確認するか決める
- [ ] 退会時のデータ保持期間（プライバシーポリシー記載の90日等）を
      実装する場合は削除予約の仕組みを追加
