import { ReactNode } from "react";
import { AppThemeProvider } from "@/presentation/theme/app-theme-provider";
import { TRPCProvider } from "@/infrastructure/trpc/provider";
import { AppShell } from "@/presentation/layout/app-shell";
import { ErrorBoundary } from "@/presentation/components/common/error-boundary";

export const metadata = {
  title: "ユーザー管理アプリ",
  description: "T3 スタックで構築するユーザー管理ツール"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <TRPCProvider>
            <AppThemeProvider>
              <AppShell>{children}</AppShell>
            </AppThemeProvider>
          </TRPCProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
