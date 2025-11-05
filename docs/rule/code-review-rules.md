# コードレビュー規約

## 1. レビュー目的

- コード品質の向上
- バグの早期発見
- 知識の共有
- アーキテクチャの一貫性維持
- セキュリティリスクの低減

## 2. レビュー観点

### 2.1 アーキテクチャ・設計

#### ✅ チェック項目

- [ ] クリーンアーキテクチャの層分離が守られているか
  - Domain → Application → Infrastructure の依存方向
  - 循環参照がないか
- [ ] 責務が適切に分離されているか（Single Responsibility）
- [ ] DIパターンが適切に使われているか（リポジトリパターン）
- [ ] ドメインロジックがプレゼンテーション層に漏れていないか
- [ ] 共通化できるロジックが重複していないか

#### ❌ アンチパターン

```typescript
// ❌ Bad: プレゼンテーション層にビジネスロジック
export const UserTable = () => {
  const handleCreate = async (values: FormValues) => {
    // ビジネスルールの検証がコンポーネント内に
    if (values.role === "ADMIN" && !currentUser.isSuperAdmin) {
      alert("権限がありません");
      return;
    }
    await createMutation.mutateAsync(values);
  };
};

// ✅ Good: ビジネスロジックはユースケース層
// use-case層でバリデーション
export class CreateUserUseCase {
  async execute(input: CreateUserInput, currentUser: User) {
    if (input.role === "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw new Error("INSUFFICIENT_PERMISSION");
    }
    // ...
  }
}
```

### 2.2 型安全性

#### ✅ チェック項目

- [ ] `any`型を使用していないか（使用する場合は正当な理由があるか）
- [ ] 型定義が適切に export されているか
- [ ] Union型やオプショナル型が適切に使われているか
- [ ] 型ガードが必要な箇所で使われているか
- [ ] tRPCのエンドツーエンド型安全性が保たれているか

#### ❌ アンチパターン

```typescript
// ❌ Bad: any型の使用
function processData(data: any) {
  return data.name.toUpperCase();  // 型安全でない
}

// ✅ Good: 適切な型定義
function processData(data: User) {
  return data.name.toUpperCase();
}

// ❌ Bad: 型アサーションの乱用
const user = data as User;  // データの検証なし

// ✅ Good: 型ガード
if (isUser(data)) {
  const user = data;  // 型安全
}
```

### 2.3 エラーハンドリング

#### ✅ チェック項目

- [ ] try-catchが適切に配置されているか
- [ ] エラーメッセージが明確か
- [ ] エラーログが適切に出力されているか
- [ ] ユーザーフレンドリーなエラー表示になっているか
- [ ] エラーの伝播が適切か（握りつぶしていないか）

#### ❌ アンチパターン

```typescript
// ❌ Bad: エラーを握りつぶす
try {
  await saveUser(user);
} catch (error) {
  // 何もしない
}

// ✅ Good: エラーを適切に処理
try {
  await saveUser(user);
} catch (error) {
  console.error("Failed to save user:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "ユーザーの保存に失敗しました"
  });
}

// ❌ Bad: 技術的なエラーメッセージをそのまま表示
<Alert severity="error">{error.message}</Alert>

// ✅ Good: ユーザーフレンドリーなメッセージ
<Alert severity="error">
  {getErrorMessage(error)}
</Alert>
```

### 2.4 パフォーマンス

#### ✅ チェック項目

- [ ] 不要なレンダリングが発生していないか
- [ ] useMemo, useCallbackが適切に使われているか
- [ ] データフェッチがサーバーサイドで行われているか
- [ ] N+1クエリ問題が発生していないか
- [ ] 大きなリストのレンダリングに仮想化が必要ないか

#### ❌ アンチパターン

```typescript
// ❌ Bad: 毎レンダリングで重い計算
const sortedUsers = users.sort((a, b) => 
  a.name.localeCompare(b.name)
);

// ✅ Good: useMemoでメモ化
const sortedUsers = useMemo(() => 
  [...users].sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);

// ❌ Bad: クライアントサイドで全件取得後フィルタ
const { data: allUsers } = trpc.user.list.useQuery();
const filtered = allUsers?.filter(/* ... */);

// ✅ Good: サーバーサイドでフィルタリング
const { data: users } = trpc.user.list.useQuery({ keyword, role });
```

### 2.5 セキュリティ

#### ✅ チェック項目

- [ ] ユーザー入力が適切にバリデーションされているか（Zod）
- [ ] SQLインジェクション対策ができているか（Prismaの使用）
- [ ] XSS対策ができているか（Reactの自動エスケープ）
- [ ] 認証・認可が適切に実装されているか
- [ ] 機密情報がログに出力されていないか
- [ ] 環境変数に機密情報が含まれていないか

#### ❌ アンチパターン

```typescript
// ❌ Bad: バリデーションなし
export const userRouter = createTRPCRouter({
  create: publicProcedure.input(z.any()).mutation(async ({ input }) => {
    // 危険：入力が検証されていない
  })
});

// ✅ Good: Zodでバリデーション
export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      role: z.enum(["ADMIN", "MANAGER", "USER"])
    }))
    .mutation(async ({ input }) => {
      // 安全：入力が検証済み
    })
});

// ❌ Bad: 機密情報をログ出力
console.log("User data:", user);  // パスワード等が含まれる可能性

// ✅ Good: 必要な情報のみログ出力
console.log("User created:", { id: user.id, email: user.email });
```

### 2.6 テスタビリティ

#### ✅ チェック項目

- [ ] ユニットテストが書きやすい設計になっているか
- [ ] 依存関係が注入可能か（DIパターン）
- [ ] モックしやすいインターフェースになっているか
- [ ] テストカバレッジが十分か
- [ ] テストケースが意味のあるシナリオをカバーしているか

#### ❌ アンチパターン

```typescript
// ❌ Bad: テストしにくい（Prismaに直結）
export class CreateUserUseCase {
  async execute(input: CreateUserInput) {
    const prisma = new PrismaClient();  // テスト不可能
    return prisma.user.create({ data: input });
  }
}

// ✅ Good: DIパターンでテスト可能
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}
  
  async execute(input: CreateUserInput) {
    return this.userRepo.create(input);
  }
}
```

### 2.7 可読性・保守性

#### ✅ チェック項目

- [ ] 変数名・関数名が意味を表しているか
- [ ] 関数が適切な長さか（目安：50行以内）
- [ ] ネストが深すぎないか（目安：3階層以内）
- [ ] マジックナンバーが定数化されているか
- [ ] コメントが適切か（自明なコメントは不要）
- [ ] 早期リターンで階層が浅くなっているか

#### ❌ アンチパターン

```typescript
// ❌ Bad: 意味不明な変数名
const d = new Date();
const x = users.filter(u => u.s === 1);

// ✅ Good: 意味のある変数名
const currentDate = new Date();
const activeUsers = users.filter(user => user.status === "ACTIVE");

// ❌ Bad: 深いネスト
if (user) {
  if (user.role === "ADMIN") {
    if (user.isActive) {
      // ...
    }
  }
}

// ✅ Good: 早期リターン
if (!user) return;
if (user.role !== "ADMIN") return;
if (!user.isActive) return;
// ...
```

### 2.8 データベース・Prisma

#### ✅ チェック項目

- [ ] マイグレーションファイルが含まれているか
- [ ] インデックスが適切に設定されているか
- [ ] N+1問題が発生していないか
- [ ] トランザクションが必要な箇所で使われているか
- [ ] ソフトデリートが適切に実装されているか

#### ❌ アンチパターン

```typescript
// ❌ Bad: N+1問題
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ 
    where: { userId: user.id } 
  });
}

// ✅ Good: includeで一括取得
const users = await prisma.user.findMany({
  include: { posts: true }
});

// ❌ Bad: トランザクションなし
await prisma.user.update({ where: { id }, data: { balance: newBalance } });
await prisma.transaction.create({ data: transactionData });

// ✅ Good: トランザクション使用
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { balance: newBalance } }),
  prisma.transaction.create({ data: transactionData })
]);
```

### 2.9 React・フロントエンド

#### ✅ チェック項目

- [ ] useEffectの依存配列が適切か
- [ ] コンポーネントが適切な粒度で分割されているか
- [ ] Client ComponentsとServer Componentsが適切に使い分けられているか
- [ ] フォームの状態管理が適切か（react-hook-form）
- [ ] アクセシビリティが考慮されているか

#### ❌ アンチパターン

```typescript
// ❌ Bad: useEffectの依存配列が不適切
useEffect(() => {
  fetchUsers(keyword);
}, []);  // keywordが変わっても再実行されない

// ✅ Good: 適切な依存配列
useEffect(() => {
  fetchUsers(keyword);
}, [keyword]);

// ❌ Bad: 巨大なコンポーネント
export const Dashboard = () => {
  // 500行のコード...
};

// ✅ Good: 適切に分割
export const Dashboard = () => {
  return (
    <>
      <DashboardHeader />
      <UserStats />
      <UserTable />
    </>
  );
};
```

## 3. レビュープロセス

### 3.1 レビュー前（作成者）

- [ ] セルフレビューを実施
- [ ] テストが通ることを確認
- [ ] リンターエラーがないことを確認
- [ ] コミットメッセージが明確
- [ ] 関連ドキュメントを更新

### 3.2 レビュー実施

- [ ] コードの意図を理解する
- [ ] アーキテクチャの整合性を確認
- [ ] セキュリティリスクをチェック
- [ ] パフォーマンスへの影響を確認
- [ ] テストの充実度を確認

### 3.3 レビューコメント

#### ✅ 良いコメント例

```
【重要】セキュリティ: ユーザー入力のバリデーションが不足しています。
Zodスキーマで email フィールドの検証を追加してください。

【提案】パフォーマンス: この計算は useMemo でメモ化できます。
レンダリングのたびに実行される可能性があります。

【質問】この早期リターンの条件は、〇〇の場合も考慮していますか？

【軽微】命名: `data` という変数名は汎用的すぎます。
`userData` や `fetchedUsers` のような具体的な名前を推奨します。
```

#### ❌ 避けるべきコメント

```
これは間違っている。
なぜこんなコードを書いたのか？
こんな書き方は見たことがない。
```

### 3.4 優先度

- **🔴 Critical（必須修正）**: セキュリティ、データ破損、クラッシュ
- **🟠 Major（修正推奨）**: バグ、パフォーマンス問題、アーキテクチャ違反
- **🟡 Minor（提案）**: リファクタリング、命名改善
- **🟢 Nit（任意）**: タイポ、コードスタイル

## 4. レビューチェックリスト

### 4.1 全般

- [ ] コードの意図が明確か
- [ ] 命名規約に従っているか
- [ ] テストが含まれているか
- [ ] ドキュメントが更新されているか
- [ ] 既存機能に影響がないか

### 4.2 バックエンド

- [ ] リポジトリパターンが使われているか
- [ ] ユースケースが適切に分離されているか
- [ ] エラーハンドリングが適切か
- [ ] トランザクションが必要な箇所で使われているか
- [ ] インデックスが適切に設定されているか

### 4.3 フロントエンド

- [ ] コンポーネントが適切な粒度か
- [ ] 状態管理が適切か
- [ ] パフォーマンスに問題がないか
- [ ] アクセシビリティが考慮されているか
- [ ] レスポンシブ対応ができているか

### 4.4 テスト

- [ ] テストケースが意味のあるシナリオをカバーしているか
- [ ] エッジケースがテストされているか
- [ ] モックが適切に使われているか
- [ ] テストの可読性が高いか

## 5. レビュー後

### 5.1 フィードバックの反映

- 指摘事項を理解し、適切に対応する
- 不明点があれば質問する
- 修正後、再度セルフレビューを実施

### 5.2 承認

- すべての Critical/Major の指摘が解決されている
- テストが通っている
- ドキュメントが更新されている

### 5.3 マージ後

- 本番環境での動作を監視
- 問題があれば速やかに対応
- レビューで学んだことを次回に活かす
