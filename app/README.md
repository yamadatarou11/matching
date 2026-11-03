# Campus Match

富山県の大学生向けマッチングアプリです。Expo / React Nativeで実装し、WebはPWAとして静的配信できます。

## セットアップ

```sh
npm install
cp .env.example .env
```

`.env` にSupabaseの値を入れます。

```txt
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 開発

```sh
npm run web
```

## PWAビルド

```sh
npm run build:web
```

出力先は `dist/` です。PWA関連のファイルは `public/` にあります。

- `public/index.html`: manifestとService Worker登録
- `public/manifest.json`: PWAの表示名、色、アイコン
- `public/sw.js`: アプリシェルと静的アセットのキャッシュ
- `public/icon.svg`, `public/maskable-icon.svg`: インストール用アイコン

## 無料公開の推奨構成

100人規模で無料運用を狙う場合は、まず以下の構成にします。

```txt
PWA配信: Cloudflare Pages
バックエンド: Supabase Free
```

Cloudflare Pagesの設定:

```txt
Root directory: app
Build command: npm run build:web
Build output directory: dist
```

環境変数:

```txt
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

公開後、Supabase AuthのSite URLとRedirect URLsにCloudflare PagesのURLを追加します。
