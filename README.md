# T3 ユーザー管理アプリ

Next.js・tRPC・Prisma をベースにしたクリーンアーキテクチャ構成のユーザー管理アプリです。Material UI を UI レイヤーに利用し、PostgreSQL（Podman + podman-compose）をデータベースとして採用します。

## セットアップ

```bash
pnpm install
pnpm db:up      # Podman で PostgreSQL を起動
pnpm prisma:migrate   # 初回のみマイグレーションを適用
pnpm prisma:generate  # Prisma Client を生成
pnpm dev              # Next.js アプリを起動（内蔵の tRPC API /api/trpc を提供）
pnpm dev:server       # 独立した Fastify + tRPC サーバーを起動（外部デプロイ向けに任意）
```

## フォルダ構成

- `src/app` – Next.js App Router エントリポイント。
- `src/presentation` – Material UI ベースの UI コンポーネント／ページ。
- `src/domain` – ドメインモデルやバリューオブジェクト。
- `src/application` – ユースケース／ポート。
- `src/infrastructure` – クライアントサイドのインフラ層。
- `src/server` – サーバーアダプタ（Fastify、Prisma など）。
- `prisma` – Prisma スキーマとマイグレーション。
- `tests` – ユニット／統合／E2E テストコード用ディレクトリ。
- `docker` – Podman Compose 用設定。

詳細は `docs/project-plan.md`、手動検証手順は `docs/manual-verification.md` を参照してください。
