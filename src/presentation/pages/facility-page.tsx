import { Container, Box, Typography, Stack } from "@mui/material";
import { FacilityTable } from "@/presentation/components/facility";

export const FacilityPage = () => {
  return (
    <Container maxWidth="lg">
      <Box py={6}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              施設マスタ管理
            </Typography>
            <Typography variant="body1" color="text.secondary">
              施設の登録・編集・無効化を行い、最新の拠点情報を管理します。
            </Typography>
          </Box>
          <FacilityTable />
        </Stack>
      </Box>
    </Container>
  );
};

export default FacilityPage;
