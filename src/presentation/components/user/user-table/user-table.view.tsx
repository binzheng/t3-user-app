import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import type { User } from "@/domain/entities/user";
import { TABLE_ROWS_PER_PAGE_OPTIONS } from "./user-table.consts";

interface UserTableViewProps {
  users: User[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  isLoading: boolean;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTableView = ({
  users,
  totalCount,
  page,
  rowsPerPage,
  isLoading,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: UserTableViewProps) => {
  if (isLoading) {
    return <Typography>読み込み中...</Typography>;
  }

  if (totalCount === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography align="center">条件に一致するユーザーが見つかりません。</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>氏名</TableCell>
            <TableCell>氏名（カナ）</TableCell>
            <TableCell>メールアドレス</TableCell>
            <TableCell>所属部署</TableCell>
            <TableCell>役職</TableCell>
            <TableCell>電話番号</TableCell>
            <TableCell>権限</TableCell>
            <TableCell>ステータス</TableCell>
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.nameKana ?? "-"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department ?? "-"}</TableCell>
              <TableCell>{user.title ?? "-"}</TableCell>
              <TableCell>{user.phoneNumber ?? "-"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton aria-label="edit" size="small" onClick={() => onEdit(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" size="small" onClick={() => onDelete(user)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={TABLE_ROWS_PER_PAGE_OPTIONS}
      />
    </TableContainer>
  );
};
