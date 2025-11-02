import { MenuItem, Paper, Stack, TextField } from "@mui/material";
import React from "react";
import type { UserRole } from "@/domain/entities/user";
import { roleOptions } from "./user-table.validation";

interface UserTableFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  role: "ALL" | UserRole;
  onRoleChange: (value: "ALL" | UserRole) => void;
}

export const UserTableFilters = ({ keyword, onKeywordChange, role, onRoleChange }: UserTableFiltersProps) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
      <TextField
        label="キーワード検索"
        placeholder="氏名・メール・部署など"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        fullWidth
      />
      <TextField
        select
        label="権限"
        value={role}
        onChange={(event) => onRoleChange(event.target.value as "ALL" | UserRole)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="ALL">すべて</MenuItem>
        {roleOptions.map((roleOption) => (
          <MenuItem key={roleOption} value={roleOption}>
            {roleOption}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  </Paper>
);
