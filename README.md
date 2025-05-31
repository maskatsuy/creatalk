# Creatalk - クリエイターとファンをつなぐビデオ通話プラットフォーム

## 概要
Creatalkは、クリエイターとファンを1対1のビデオ通話でつなぐプラットフォームです。クリエイターとファンの間で、より直接的で価値のある交流を実現します。

## 主な機能
- リアルタイムビデオ通話（Daily.co）
- 安全な決済処理（Stripe）
- 高度な予約システム
- クリエイターダッシュボード
- 分析機能

## 技術スタック
- Next.js 15（App Router）with Turbopack
- TypeScript（Strict Mode）
- Tailwind CSS + shadcn/ui（Zinc color scheme）
- ESLint + Prettier
- Supabase（認証、データベース、リアルタイム機能、RLS）
- Daily.co（ビデオ通話API、録画機能）
- Stripe（テストモード、ワンタイム決済）

## 開発環境のセットアップ

### 必要条件
- Node.js 18.0.0以上
- npm
- Supabase CLIがインストールされていること
- Supabaseアカウント
- Daily.coアカウント
- Stripeアカウント（テストモード）

### インストール手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd creatalk
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
```bash
cp .env.example .env.local
```
`.env.local`ファイルを編集し、必要な環境変数を設定してください。

4. 開発サーバーの起動
```bash
npm run dev
```

## Supabaseのセットアップ

### データベースマイグレーション手順

1. Supabase CLIにログイン
```bash
supabase login
```

2. プロジェクトのリンク
```bash
# Project Reference IDはSupabaseダッシュボードの「Project Settings」→「General settings」から取得
supabase link --project-ref your-project-ref
```

3. マイグレーションの実行状態を確認
```bash
supabase migration list
```

4. マイグレーションの実行
```bash
supabase db push
```

注意: マイグレーションの競合が発生した場合は、以下のコマンドで修復できます：
```bash
supabase migration repair --status reverted [conflicting-migration-id]
supabase migration repair --status applied [your-migration-id]
```

### データベース設定
- Supabase Cloudのみを使用（ローカル環境は使用しない）
- マイグレーションファイルはバージョン管理
- 全テーブルにRLSポリシーを適用
- Realtime機能を活用した状態同期

### 認証設定
1. メール認証の有効化
2. Google OAuth の設定
3. RLS（Row Level Security）ポリシーの設定

## アプリケーション構造
```
src/
├── app/                 # Appルーターページ
│   ├── (auth)/         # 認証関連
│   ├── dashboard/      # ユーザーダッシュボード
│   ├── creators/       # クリエイター一覧・詳細
│   ├── creator/        # クリエイター管理
│   ├── call/           # ビデオ通話
│   ├── profile/        # プロフィール設定
│   └── api/            # APIルート
├── components/         # Reactコンポーネント
├── actions/           # サーバーアクション
├── lib/              # ユーティリティ
├── types/            # 型定義
└── hooks/            # カスタムフック
```

## 通話商品の種類
1. キューシステム
   - 21:00-22:00の時間枠
   - 休憩システムあり

2. 固定スロット
   - 5分単位の予約（例：21:00-21:05）
   - 予約可能時間の柔軟な設定

## 開発ガイドライン

### コーディング規約
- src/ディレクトリ構造を使用
- インポートエイリアス: @/* → src/*
- APIルートよりもServer Actionsを優先
- TypeScript Strict Mode
- ESLint + Prettierでコード整形
- コンポーネント名: PascalCase
- ファイル名: kebab-case

### エラーハンドリング
- Server Actionsでのtry-catch
- ユーザーフレンドリーなエラーメッセージ
- 非同期処理のローディング状態
- フォームバリデーション

### UIパターン
- モバイルファーストのレスポンシブデザイン
- ダークモードサポート
- shadcn/uiコンポーネント
- 一貫性のあるローディング状態
- エラーバウンダリー
- リアルタイム更新（Supabase Realtime）
- トースト通知

## デプロイ
- Vercelを推奨
- 本番環境の環境変数設定
- Supabase本番プロジェクトの設定
- Stripeの本番モード設定

## ライセンス
[ライセンス情報を記載]