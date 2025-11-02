import { MenuItem, Paper, Stack, TextField } from "@mui/material";
import React from "react";
import type { FacilityCategory, FacilityStatus } from "@/domain/entities/facility";
import { categoryOptions, statusOptions } from "./facility-table.validation";

interface FacilityTableFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  category: "ALL" | FacilityCategory;
  onCategoryChange: (value: "ALL" | FacilityCategory) => void;
  status: "ALL" | FacilityStatus;
  onStatusChange: (value: "ALL" | FacilityStatus) => void;
}

export const FacilityTableFilters = ({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  status,
  onStatusChange
}: FacilityTableFiltersProps) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ lg: "center" }}>
      <TextField
        label="キーワード検索"
        placeholder="施設名・コード・所在地など"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        fullWidth
      />
      <TextField
        select
        label="種別"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value as "ALL" | FacilityCategory)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="ALL">すべて</MenuItem>
        {categoryOptions.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="ステータス"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as "ALL" | FacilityStatus)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="ALL">すべて</MenuItem>
        {statusOptions.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  </Paper>
);
