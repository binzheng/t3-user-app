"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              gap: 3,
              py: 4
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main" }} />
            <Typography variant="h4" component="h1" gutterBottom>
              エラーが発生しました
            </Typography>
            <Alert severity="error" sx={{ width: "100%" }}>
              <Typography variant="body2">
                予期しないエラーが発生しました。
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <>
                    <br />
                    <br />
                    <strong>エラー詳細:</strong>
                    <br />
                    {this.state.error.message}
                  </>
                )}
              </Typography>
            </Alert>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" onClick={this.handleReset}>
                トップページに戻る
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                ページを再読み込み
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
