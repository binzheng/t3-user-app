import { type ReactNode } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

interface QueryStateHandlerProps<T> {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  children: (data: T) => ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "予期しないエラーが発生しました";
}

export function QueryStateHandler<T>({
  isLoading,
  error,
  data,
  children,
  emptyMessage = "データがありません",
  loadingMessage = "読み込み中..."
}: QueryStateHandlerProps<T>): ReactNode {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{loadingMessage}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return <>{children(data)}</>;
}
