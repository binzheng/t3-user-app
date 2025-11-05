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

## CI/CD（GitHub Actions + Vercel + Neon）

- GitHub Actions のワークフローを `.github/workflows/ci-cd.yml` に追加しました。`main` ブランチへの PR / push で lint と単体テスト、`main` に push されたタイミングで Vercel への本番デプロイを実行します。
- テストジョブではコンテナ上の PostgreSQL（postgres:16）にマイグレーションを適用してから `pnpm lint` / `pnpm test` を実行します。
- デプロイジョブは以下の GitHub Secrets を利用します。Vercel 側にも同じ値（`DATABASE_URL` など）を Environment Variables として設定してください。
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` – Vercel CLI 用の認証情報。
  - `NEON_DATABASE_URL` – Neon の接続文字列（マイグレーション実行用。`sslmode=require` を付けてください）。
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`（任意）– NextAuth / フロントエンド用の環境変数。
- Neon を利用する場合は「Branch > Connection String」からダイレクト接続用の URI をコピーし、上記 `NEON_DATABASE_URL` に設定してください。プール接続を使う場合は `?sslmode=require` を付与したダイレクト接続文字列を推奨します。
- ワークフローは `workflow_dispatch` にも対応しているので、GitHub Actions から手動実行することも可能です。
