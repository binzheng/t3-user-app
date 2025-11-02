import { Container, Box, Typography, Stack } from "@mui/material";
import { UserTable } from "@/presentation/components/user";

export const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box py={6}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              ユーザー管理ダッシュボード
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ユーザーの登録・編集・削除を tRPC 経由で管理できます。
            </Typography>
          </Box>
          <UserTable />
        </Stack>
      </Box>
    </Container>
  );
};

export default HomePage;
