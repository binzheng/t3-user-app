# コーディング規約

## 1. 言語・フレームワーク

- **TypeScript**: 型安全性を最大限活用し、`any`の使用は原則禁止
- **Next.js**: App Routerを使用し、Server ComponentsとClient Componentsを適切に使い分ける
- **React**: Hooks APIを使用し、関数コンポーネントで統一
- **tRPC**: フロントエンドとバックエンド間の型安全な通信に使用

## 2. プロジェクト構造

### 2.1 ディレクトリ構成

```
src/
├── app/                      # Next.js App Router
├── presentation/             # プレゼンテーション層
│   ├── components/          # UIコンポーネント（機能別サブフォルダ）
│   ├── layout/              # 共通レイアウト
│   └── pages/               # ページコンポーネント
├── domain/                  # ドメイン層
│   └── entities/            # エンティティ定義
├── server/                  # サーバーサイド層
│   ├── application/         # アプリケーション層
│   │   ├── use-cases/      # ユースケース（機能別サブフォルダ）
│   │   └── ports/          # リポジトリインターフェース
│   ├── infrastructure/      # インフラ層
│   │   └── prisma/         # Prismaリポジトリ実装
│   └── trpc/               # tRPC設定・ルーター
└── infrastructure/          # フロントエンド向けインフラ
    └── trpc/               # tRPCクライアント設定
```

### 2.2 層間依存ルール

- **内側から外側への依存のみ許可**: Domain → Application → Infrastructure
- **プレゼンテーション層**: インフラストラクチャ層（tRPCクライアント）のみ参照
- **循環参照は禁止**

## 3. 命名規約

### 3.1 ファイル・ディレクトリ

- **ケバブケース**: `user-table.tsx`, `list-users.ts`
- **コンポーネントファイル**: 拡張子は`.tsx`
- **ロジックファイル**: 拡張子は`.ts`
- **テストファイル**: `*.test.ts`, `*.test.tsx`, `*.spec.ts`

### 3.2 TypeScript

- **型名**: PascalCase（`User`, `UserRepository`, `CreateUserInput`）
- **インターフェース**: PascalCase、接頭辞`I`は不要
- **型エイリアス**: PascalCase
- **関数・変数**: camelCase（`listUsers`, `userName`）
- **定数**: UPPER_SNAKE_CASE（`USER_ROLES`, `MAX_PAGE_SIZE`）
- **プライベートフィールド**: 接頭辞なし（TypeScriptのprivateキーワードで制御）
- **真偽値**: `is`, `has`, `should`などの接頭辞を使用（`isActive`, `hasPermission`）

### 3.3 コンポーネント

- **コンポーネント名**: PascalCase（`UserTable`, `AppShell`）
- **ファイル名**: ケバブケース（`user-table.tsx`, `app-shell.tsx`）
- **Hooksカスタム**: `use`接頭辞（`useUserList`, `useAuth`）

## 4. TypeScript規約

### 4.1 型定義

```typescript
// ✅ Good: 明示的な型定義
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad: any型の使用
function processData(data: any): any {
  // ...
}

// ✅ Good: 厳密なnullチェック
function formatName(name: string | null): string {
  return name ?? "Unknown";
}
```

### 4.2 オプショナルとnull

- **オプショナル（`?`）**: 値が存在しない可能性がある場合
- **null**: 明示的に値がないことを示す場合
- **undefined**: 初期化されていない状態

```typescript
// ✅ Good: 用途に応じて使い分け
interface CreateUserInput {
  name: string;
  email: string;
  phoneNumber?: string;  // オプショナル：入力不要
  department: string | null;  // null許可：明示的に「なし」を示す
}
```

### 4.3 型ガード

```typescript
// ✅ Good: 型ガードの使用
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj
  );
}
```

## 5. React規約

### 5.1 コンポーネント定義

```typescript
// ✅ Good: 関数コンポーネント、明示的な型定義
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  // ...
};

// ❌ Bad: デフォルトエクスポート（名前付きエクスポートを推奨）
export default function UserTable(props: any) {
  // ...
}
```

### 5.2 Hooks

```typescript
// ✅ Good: カスタムHooksの分離
function useUserList() {
  const { data, isLoading, error } = trpc.user.list.useQuery();
  
  return {
    users: data ?? [],
    isLoading,
    error
  };
}

// コンポーネントで使用
const { users, isLoading } = useUserList();
```

### 5.3 イベントハンドラ

```typescript
// ✅ Good: handle接頭辞
const handleSubmit = (event: FormEvent) => {
  event.preventDefault();
  // ...
};

const handleDelete = async (id: string) => {
  if (window.confirm("削除しますか？")) {
    await deleteMutation.mutateAsync({ id });
  }
};
```

### 5.4 条件レンダリング

```typescript
// ✅ Good: 明示的な条件分岐
if (isLoading) {
  return <Typography>読み込み中...</Typography>;
}

if (error) {
  return <Alert severity="error">{error.message}</Alert>;
}

if (users.length === 0) {
  return <Typography>データがありません</Typography>;
}

return <UserList users={users} />;

// ❌ Bad: 複雑な三項演算子のネスト
return isLoading ? <Loading /> : error ? <Error /> : users.length === 0 ? <Empty /> : <List />;
```

## 6. 非同期処理

### 6.1 async/await

```typescript
// ✅ Good: async/await、エラーハンドリング
const handleSubmit = async (values: FormValues) => {
  try {
    await createMutation.mutateAsync(values);
    setSuccess(true);
  } catch (error) {
    console.error("Failed to create user:", error);
    setError(error instanceof Error ? error.message : "Unknown error");
  }
};

// ❌ Bad: Promiseチェーン、エラーハンドリングなし
const handleSubmit = (values: FormValues) => {
  createMutation.mutateAsync(values).then(() => {
    setSuccess(true);
  });
};
```

### 6.2 tRPC

```typescript
// ✅ Good: キャッシュ無効化とエラーハンドリング
const createMutation = trpc.user.create.useMutation({
  onSuccess: async () => {
    await utils.user.list.invalidate();
    setDialogOpen(false);
  },
  onError: (error) => {
    console.error("Creation failed:", error);
  }
});
```

## 7. データベース・Prisma

### 7.1 スキーマ定義

```prisma
// ✅ Good: 明確な型定義、デフォルト値、インデックス
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String
  role        String   @default("USER")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([name])
}
```

### 7.2 リポジトリパターン

```typescript
// ✅ Good: インターフェース定義とクリーンアーキテクチャ
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  search(input: SearchUsersInput): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

// 実装
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomain(user) : null;
  }
  // ...
}
```

## 8. エラーハンドリング

### 8.1 カスタムエラー

```typescript
// ✅ Good: 明示的なエラーメッセージ
if (!user) {
  throw new Error("USER_NOT_FOUND");
}

if (existingEmail) {
  throw new Error("EMAIL_ALREADY_EXISTS");
}

// tRPCでのエラー変換
catch (error) {
  if (error instanceof Error && error.message === "USER_NOT_FOUND") {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "ユーザーが見つかりません" 
    });
  }
  throw error;
}
```

### 8.2 フロントエンドエラー表示

```typescript
// ✅ Good: ユーザーフレンドリーなエラーメッセージ
{error && (
  <Alert severity="error">
    {error.message === "EMAIL_ALREADY_EXISTS"
      ? "このメールアドレスは既に登録されています"
      : "エラーが発生しました。もう一度お試しください。"}
  </Alert>
)}
```

## 9. パフォーマンス

### 9.1 useMemo, useCallback

```typescript
// ✅ Good: 重い計算結果をメモ化
const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

const handleDelete = useCallback((id: string) => {
  deleteMutation.mutate({ id });
}, [deleteMutation]);
```

### 9.2 データフェッチング

```typescript
// ✅ Good: サーバーサイドでフィルタリング
const { data: users } = trpc.user.list.useQuery({
  keyword: searchKeyword,
  role: searchRole
});

// ❌ Bad: クライアントサイドで全件取得後フィルタ
const { data: allUsers } = trpc.user.list.useQuery();
const filtered = allUsers?.filter(u => u.role === searchRole);
```

### 9.3 ローディング表示

**非同期処理の種類に応じて適切なローディング表示を使い分ける**

#### グローバルローディング（全画面）
Mutation操作（作成・更新・削除）など、ユーザーアクションに対する処理中は画面全体をブロック

```typescript
// ✅ Good: Backdrop + CircularProgress
import { Backdrop, CircularProgress } from "@mui/material";

const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (values: FormValues) => {
  setIsLoading(true);
  try {
    await createMutation.mutateAsync(values);
  } finally {
    setIsLoading(false);
  }
};

return (
  <>
    {/* メインコンテンツ */}
    <Backdrop open={isLoading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  </>
);
```

#### 部分ローディング（スケルトン）
データフェッチ中など、特定のUIコンポーネントのみローディング状態を表示

```typescript
// ✅ Good: Skeleton表示
import { Skeleton, Stack } from "@mui/material";

if (isLoading) {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={60} />
      <Skeleton variant="rectangular" height={60} />
      <Skeleton variant="rectangular" height={60} />
    </Stack>
  );
}
```

#### ローディング表示の使い分け指針

| 操作種別 | ローディング表示 | 理由 |
|---------|----------------|------|
| **Mutation（作成・更新・削除）** | Backdrop + CircularProgress | ユーザー操作をブロックして二重送信を防止 |
| **Query（初期データ取得）** | Skeleton | UIの構造を維持し、UX向上 |
| **Query（再取得・検索）** | 既存データ表示 + ローディング表示 | データが既にある場合は表示を維持 |
| **ダイアログ内の処理** | ダイアログ内にCircularProgress | ダイアログを閉じさせない |

```typescript
// ✅ Good: Mutationはグローバルローディング
const createMutation = trpc.user.create.useMutation({
  onMutate: () => setGlobalLoading(true),
  onSettled: () => setGlobalLoading(false)
});

// ✅ Good: Queryはスケルトン
const { data: users, isLoading } = trpc.user.list.useQuery();

if (isLoading) {
  return <UserTableSkeleton />;
}
```

## 10. コメント・ドキュメント

### 10.1 コメント規約

```typescript
// ✅ Good: 必要な箇所のみコメント
// Prismaの仕様上、insensitiveモードはPostgreSQLでのみ動作
const users = await this.prisma.user.findMany({
  where: { name: { contains: keyword, mode: "insensitive" } }
});

// ❌ Bad: 自明なコメント
// ユーザーを取得する
const user = await getUser(id);
```

### 10.2 JSDoc

```typescript
// ✅ Good: 公開APIにはJSDoc
/**
 * ユーザーを検索する
 * @param input 検索条件（キーワード、権限）
 * @returns 検索結果のユーザー配列
 */
async search(input: SearchUsersInput): Promise<User[]> {
  // ...
}
```

## 11. テスト

### 11.1 テストファイル構成

```typescript
// ✅ Good: describeでグルーピング、明確なテストケース
describe("User use cases", () => {
  let repo: InMemoryUserRepository;
  
  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });
  
  describe("create", () => {
    it("creates a new user with valid input", async () => {
      const useCase = new CreateUserUseCase(repo);
      const user = await useCase.execute({
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        status: "ACTIVE"
      });
      
      expect(user.email).toBe("test@example.com");
    });
    
    it("throws error when email already exists", async () => {
      // ...
    });
  });
  
  describe("search functionality", () => {
    // ...
  });
});
```

## 12. セキュリティ

### 12.1 入力検証

```typescript
// ✅ Good: Zodによる入力検証
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
  phoneNumber: z.string().regex(/^[0-9-]+$/).optional()
});
```

### 12.2 認可

```typescript
// ✅ Good: 権限チェック（将来実装）
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});
```

## 13. Material-UI

### 13.1 コンポーネント使用

```typescript
// ✅ Good: sxプロップで一貫したスタイリング
<Box sx={{ p: 3, mb: 2, borderRadius: 2 }}>
  <Typography variant="h6">タイトル</Typography>
</Box>

// ❌ Bad: インラインstyle
<div style={{ padding: "24px", marginBottom: "16px" }}>
  <h6>タイトル</h6>
</div>
```

### 13.2 テーマの活用

```typescript
// ✅ Good: テーマカラーの使用
<Button variant="contained" color="primary">
  保存
</Button>

<Alert severity="error">エラーメッセージ</Alert>
```

## 14. その他

### 14.1 マジックナンバー

```typescript
// ✅ Good: 定数化
const MAX_NAME_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 20;

// ❌ Bad: マジックナンバー
if (name.length > 100) { /* ... */ }
```

### 14.2 早期リターン

```typescript
// ✅ Good: 早期リターンで階層を浅く
function processUser(user: User | null): string {
  if (!user) {
    return "Unknown";
  }
  
  if (!user.name) {
    return user.email;
  }
  
  return user.name;
}

// ❌ Bad: ネストが深い
function processUser(user: User | null): string {
  if (user) {
    if (user.name) {
      return user.name;
    } else {
      return user.email;
    }
  } else {
    return "Unknown";
  }
}
```

### 14.3 分割代入

```typescript
// ✅ Good: 分割代入
const { name, email, role } = user;

// ❌ Bad: 繰り返しアクセス
const userName = user.name;
const userEmail = user.email;
const userRole = user.role;
```
