# T3ユーザー管理アプリ – プロジェクト計画

## 目標
- T3 スタック（Next.js、tRPC、Prisma）と PostgreSQL を用いたユーザー・施設管理アプリを構築する。
- `src` 配下でクリーンアーキテクチャに基づいた層分離（presentation/domain/application/infrastructure/server）を徹底し、疎結合を実現する。
- 本番用ソースディレクトリの外側（`tests/`）に自動テストを集約し、ユニット／フロントエンドコンポーネント／E2E を継続的に実行する。
- ローカルの Podman コンテナサービス、包括的なテスト、CI/CD を含むエンドツーエンドの自動化を整備する。
- フロントエンドのコンポーネントライブラリとして Material UI を採用し、アプリ共通のレイアウト（ヘッダー＋サイドメニュー）を提供する。

## ディレクトリ構成
```
.
├── src
│   ├── app              # Next.js App Router エントリポイント
│   ├── presentation     # UI コンポーネント／ページ
│   ├── domain           # ドメインモデル／バリューオブジェクト
│   ├── application      # ユースケース／ポート
│   ├── infrastructure   # クライアント側インフラ層
│   └── server           # サーバー側（config/application/infrastructure/interfaces）
├── prisma               # Prisma スキーマ、マイグレーション、シードスクリプト
├── tests                # ユニット・統合・E2E テスト（本番ソース外）
├── docker               # Podman Compose 設定
└── docs                 # 設計ドキュメント
```

## 技術選定
- **フロントエンド:** Next.js（App Router）、Material UI、データ取得に React Query（TanStack Query）、スキーマ検証に Zod。
- **バックエンド:** tRPC による型安全な API レイヤー、Prisma ORM、認証は NextAuth、プロダクションでは Fastify アダプターを使用。
- **データベース:** PostgreSQL を Podman Compose（Docker Compose 互換）でローカル管理し、マイグレーションは Prisma が担当。
- **テスト:** ユニット／インテグレーションに Vitest、UI テストに React Testing Library、E2E に Playwright。
- **ツール:** Next.js ビルドツールチェーン、ESLint + Prettier、パッケージマネージャーは pnpm。

## アーキテクチャ指針
- クリーンアーキテクチャを採用し、ドメイン層、ユースケース層、アダプタ層（プレゼンテーション／インフラ）を明確に分離して疎結合を保つ。
- tRPC のルーター、Prisma の実装、Next.js の UI はすべてユースケースインターフェースを介して連携させ、層をまたぐ直接依存を避ける。
- ドメインモデルやユースケースはテスト容易性を優先し、外部ライブラリへの依存を最小化する。
- 共通ロジックは `src` 内の層（domain/application 等）に集約し、副作用を限定して再利用性を高める。

## アプリケーションの役割
- **アプリケーション本体**
  - Next.js App Router を用いた UI を提供し、Material UI によるテーマ／コンポーネントを `src/presentation` で管理。
  - `src` 配下でクリーンアーキテクチャ層（domain/application/infrastructure/presentation/server）を定義し、疎結合を維持。
  - サーバー側は Fastify + tRPC でユーザー CRUD を提供し、Prisma を通じて PostgreSQL と連携。開発時は Next.js の `/api/trpc` から同一ルーターを利用できる。
  - NextAuth や Webhook、監査ログなどの拡張ポイントは `src/server` 以下に整理する。

## データモデル（現状）
- `User`: id(UUID)、email、name、nameKana、role、status、phoneNumber、department、title、image、note、lastLoginAt、mfaEnabled、isLocked、createdBy/updatedBy、createdAt/updatedAt。
- `Facility`: id(UUID)、code、name、nameKana、category、status、所在地（country/prefecture/city/addressLine1/postalCode）、連絡先（phone/email/contactName/contactPhone/contactEmail）、稼働期間（startDate/endDate）、capacity、note、imageUrl、syncedAt、isIntegrated、displayOrder、billingCode、監査情報。
- `AuditLog`: id、userId、actorId、action、metadata(JSON)、createdAt。
- NextAuth 用の追加テーブル（accounts、sessions、verification tokens）。

## ローカル開発
1. `pnpm install`
2. `pnpm db:up` で Podman Compose（`docker/docker-compose.yml`）互換設定を用いて PostgreSQL を起動。
3. `pnpm prisma migrate dev` でマイグレーションを適用。
4. `pnpm dev` で Next.js 開発サーバーを起動し、必要に応じて `pnpm dev:server` で Fastify サーバーを並行起動。

`.env` ファイルで環境変数を管理し、`src/server/config` でスキーマ検証を行う。

Podman をコンテナランタイムとして利用し、Compose 互換の操作は `podman-compose` コマンドを前提とする（必要に応じてエイリアスを設定）。

## テスト戦略
- **ユニット（バックエンド）:** `tests/backend` にユーザー／施設ユースケースのテストを配置済み。Prisma のリポジトリ実装はユニットテスト用にインメモリリポジトリで置き換え、メール重複・コード重複・論理削除などの異常系を検証。
- **フロントエンドコンポーネント:** `tests/frontend` に UserTable / FacilityTable の React Testing Library テストを追加。tRPC クライアントをモックし、フォーム送信 payload や UI 状態（一覧表示・モーダル制御）を確認。Vitest の `environmentMatchGlobs` で `jsdom` を利用予定（要 `pnpm install`）。
- **E2E:** `tests/e2e/user-crud.spec.ts` で Playwright による CRUD フローを実装済み。施設画面の E2E テストは今後追加予定（仕様書 `docs/facility-screen-test-spec.md` を参照）。
- フィクスチャ／ファクトリは `tests/shared` に配置予定。
- CI では Lint/Unit/Component/E2E を順に実行し、カバレッジレポートを収集する。

## CI/CD パイプライン（GitHub Actions）
1. **lint**: ESLint と TypeScript の型チェック。
2. **test**: PostgreSQL サービスコンテナを用いたユニットおよび統合テスト。
3. **e2e**: デプロイ済みプレビュー（Vercel Preview もしくはステージング環境）に対する Playwright。
4. **build**: Next.js のビルドを実行し、静的アセットとサーバーコンポーネントを生成。
5. **deploy**: main ブランチでバックエンドを Fly.io／Render 等のマネージド Node 環境へ、フロントを Vercel へデプロイ、あるいは Podman でビルドしたコンテナイメージをレジストリへプッシュ（最終決定は今後検討）。

pnpm ストアを actions/cache で保存する。

## セキュリティとコンプライアンス
- `.env.example` テンプレートで環境変数を管理。
- 秘密情報は GitHub の暗号化シークレットで保管。
- 本番環境では HTTPS とセキュアクッキーを強制。
- ユーザー変更の監査ログを記録。

## 実装状況サマリ（2024-XX-XX 時点）
- ユーザー管理ダッシュボード（CRUD、ソート、モーダル入力、ステータス／権限更新）を実装済み。
- 施設マスタ管理画面（一覧、登録・編集モーダル、無効化操作、所在地／連絡先項目）を実装。
- アプリ全体を共通レイアウト `AppShell` でラップし、上部ヘッダー（アイコン・ユーザー名・ログアウトボタン）と左サイドメニュー（ユーザー／施設ナビゲーション）を提供。
- Prisma スキーマにユーザー／施設拡張フィールドを追加し、対応するリポジトリ・tRPC ルーター・ユースケースを実装。
- バックエンド／フロントエンドユニットテストを追加。フロントエンドテストは `jsdom` 導入後に実行可能。
- 仕様・テスト仕様書を `docs/user-*`, `docs/facility-*` に整備済み。

## 未完タスク / 次のアクション
1. `pnpm install` 実行後に `pnpm test:frontend` を再確認（`jsdom` 依存を解決）。
2. Prisma マイグレーション生成＆適用（`pnpm prisma:migrate dev`）で DB スキーマを最新化。
3. 施設マスタの E2E テスト（Playwright）を追加し、仕様書 (`docs/facility-screen-test-spec.md`) の未実装ケースを消化。
4. CI/CD ワークフローに facility テストと Prisma マイグレーション確認を組み込む。
