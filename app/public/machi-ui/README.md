# Campus Match UI

このディレクトリは、公開中の Campus Match Web 版で使う UI の正本です。

- 画面・コンポーネントの分割は、町あぷ MVP の構成を引き継いでいます。
- 実データの取得・保存には `src/services/` の Supabase 連携を使います。localStorage やダミーデータの実装を追加しないでください。
- UI を変更するときは、このディレクトリだけを変更します。
- JavaScript/CSS は Service Worker で network-first 配信されます。Service Worker 自体やアプリシェルを変更するときは、`app/public/sw.js` のキャッシュ名を更新してください。

`archive/町あぷverΩ/町あぷmvp` は旧PWAのアーカイブです。新規機能やバグ修正の対象にはしません。
