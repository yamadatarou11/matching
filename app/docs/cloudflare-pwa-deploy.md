# Cloudflare PagesでPWAを無料公開する手順

100人規模で無料運用を狙う場合は、Cloudflare Pages + Supabase Freeが一番シンプルです。

## 1. 事前確認

```sh
cd app
npm run build:web
```

`dist/` が生成されればOKです。

## 2. GitHubへpush

Cloudflare PagesはGitHubリポジトリと連携して自動デプロイできます。

## 3. Cloudflare Pages作成

Cloudflare Dashboardで:

- Workers & Pages
- Create application
- Pages
- Connect to Git
- このリポジトリを選択

ビルド設定:

```txt
Root directory: app
Build command: npm run build:web
Build output directory: dist
```

環境変数:

```txt
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 4. Supabase Auth設定

Cloudflare PagesのURLが出たら、Supabase Dashboardで設定します。

- Authentication
- URL Configuration
- Site URL: Cloudflare Pagesの本番URL
- Redirect URLs: Cloudflare Pagesの本番URLを追加

例:

```txt
https://campus-match.pages.dev/**
```

## 5. PWA確認

Chrome DevToolsで:

- Application
- Manifest
- Service Workers

確認すること:

- manifestが読み込まれている
- Service Workerがregisteredになっている
- Install appが表示される
- オフライン時に最低限アプリシェルが開く

## 無料枠に収めるための運用ルール

- プロフィール写真は最大4枚
- 画像はアップロード前に300KBから500KB程度へ圧縮
- スワイプ画面では1枚目だけ先読み
- 詳細画面を開いた時だけ追加画像を読み込む
- 動画アップロードは禁止
- Supabase Usageを週1で確認
