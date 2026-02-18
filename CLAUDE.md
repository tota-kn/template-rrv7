# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語

日本語で応答してください。

## 開発コマンド

- `pnpm run dev` - 開発サーバー起動（HMR対応）
- `pnpm run build` - 本番ビルド
- `pnpm run preview` - 本番ビルドをローカルでプレビュー
- `pnpm run typecheck` - 型チェック（cf-typegen → react-router typegen → tsc -b）
- `pnpm run deploy` - Cloudflare Workers へデプロイ

パッケージマネージャーは **pnpm**。テスト・リンターは未導入。

## アーキテクチャ

React Router v7 フルスタックフレームワーク + Cloudflare Workers で動作するSSRアプリ。

- **ルーティング**: `app/routes.ts` でルート定義、`app/routes/` にページコンポーネント
- **コンポーネント**: `app/components/` に配置
- **スタイリング**: Tailwind CSS v4（Viteプラグイン統合、`app/app.css` でインポート）
- **サーバー**: `app/entry.server.tsx` でSSR処理、`workers/app.ts` がCloudflare Workerエントリーポイント
- **ルートレイアウト**: `app/root.tsx`（Links, Meta, ScrollRestoration, Scripts 含む）
- **設定**: `react-router.config.ts` で SSR 有効化、`v8_viteEnvironmentApi` future flag 有効

## Cloudflare Workers 連携

- `workers/app.ts` で `AppLoadContext` を拡張し、`cloudflare.env`（`Env`型）と `cloudflare.ctx` を注入
- `Env` 型は `worker-configuration.d.ts` に自動生成される（`pnpm run cf-typegen` / `wrangler types`）
- loader/action から `context.cloudflare.env` でCloudflareバインディング（KV, D1, 環境変数等）にアクセス
- 環境変数は `wrangler.jsonc` の `vars` で定義

## TypeScript

- strict モード有効
- パス別名: `~/` → `app/`
- 3つのtsconfig: 基本（`tsconfig.json`）、Cloudflare用（`tsconfig.cloudflare.json`）、Node用（`tsconfig.node.json`）
- React Routerが `.react-router/types/` に型を自動生成
- ルートの型は `import type { Route } from "./+types/<ルートファイル名>"` でインポート（`Route.LoaderArgs`, `Route.ComponentProps` 等）

## 命名規則

- ファイル: ケバブケース（`poker-position-trainer.tsx`）
- コンポーネント: PascalCase
- 関数: camelCase
- 定数: UPPER_SNAKE_CASE
