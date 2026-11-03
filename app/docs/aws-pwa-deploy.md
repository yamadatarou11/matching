# AWS無料枠でPWAを配信する手順

このアプリは `npm run build:web` で `dist/` に静的ファイルを書き出せます。MVP段階ではサーバーを持たず、S3 + CloudFront でHTTPS配信する構成が一番軽いです。

## 1. Webビルド

```sh
cd app
npm run build:web
```

## 2. S3バケットへアップロード

```sh
aws s3 mb s3://YOUR_BUCKET_NAME
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

## 3. CloudFrontを作成

- OriginはS3バケットにする
- Origin Access Controlを有効にして、S3バケットは公開しない
- Viewer protocol policyは `Redirect HTTP to HTTPS`
- Default root objectは `index.html`
- SPAルーティング用に 403 / 404 のカスタムエラーレスポンスを `/index.html`、HTTP 200 にする

## 4. 更新時

```sh
cd app
npm run build:web
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 注意

- PWAインストールにはHTTPSが必要です。CloudFrontのドメインか、ACM証明書を設定した独自ドメインで確認してください。
- AWS無料枠の条件は変更されるため、公開前にFree TierとCloudFront/S3の料金ページを確認してください。
- Supabaseを使う画面は通信が必要です。Service Workerはアプリシェルと静的アセットをキャッシュしますが、認証やDB更新はオンライン前提です。
