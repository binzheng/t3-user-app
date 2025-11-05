"use client";

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { type ChangeEvent, useEffect, useMemo, useState } from "react";
import type { Facility, FacilityCategory, FacilityStatus } from "@/domain/entities/facility";
import { trpc } from "@/infrastructure/trpc/client";
import { FacilityTableFilters } from "./facility-table/facility-table.filters";
import { CSV_HEADERS, TABLE_ROWS_PER_PAGE_OPTIONS } from "./facility-table/facility-table.consts";
import { buildCsvContent, paginate } from "./facility-table/facility-table.utils";
import {
  type CreateFacilityFormValues,
  type EditFacilityFormValues,
  categoryOptions,
  createDefaultValues,
  createFacilityFormSchema,
  editDefaultValues,
  editFacilityFormSchema,
  statusOptions,
  toEditFormValues
} from "./facility-table/facility-table.validation";
import { GlobalLoading, TableSkeleton } from "@/presentation/components/common";

const TABLE_ROWS_PER_PAGE_DEFAULT = TABLE_ROWS_PER_PAGE_OPTIONS[1] ?? 10;

const toOptional = (value?: string) => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNullable = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toOptionalNumber = (value?: string) => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toNullableNumber = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

const toDateValue = (value?: string) => {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00Z`);
};

const toDateOrNull = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value.trim().length === 0) return null;
  return new Date(`${value}T00:00:00Z`);
};

export const FacilityTable = () => {
  const utils = trpc.useUtils();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchCategory, setSearchCategory] = useState<"ALL" | FacilityCategory>("ALL");
  const [searchStatus, setSearchStatus] = useState<"ALL" | FacilityStatus>("ALL");
  const [globalLoading, setGlobalLoading] = useState(false);
  
  const { data: facilities, isLoading, isFetching, refetch } = trpc.facility.list.useQuery({
    keyword: searchKeyword || undefined,
    category: searchCategory === "ALL" ? undefined : searchCategory,
    status: searchStatus === "ALL" ? undefined : searchStatus
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Facility | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(TABLE_ROWS_PER_PAGE_DEFAULT);

  const {
    register: registerCreate,
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors }
  } = useForm<CreateFacilityFormValues>({
    resolver: zodResolver(createFacilityFormSchema),
    defaultValues: createDefaultValues,
    mode: "onBlur"
  });

  const {
    register: registerEdit,
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors }
  } = useForm<EditFacilityFormValues>({
    resolver: zodResolver(editFacilityFormSchema),
    defaultValues: editDefaultValues,
    mode: "onBlur"
  });

  useEffect(() => {
    if (editTarget) {
      resetEditForm(toEditFormValues(editTarget));
    } else {
      resetEditForm(editDefaultValues);
    }
  }, [editTarget, resetEditForm]);

  const createMutation = trpc.facility.create.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.facility.list.invalidate();
      setCreateOpen(false);
      resetCreateForm(createDefaultValues);
    },
    onSettled: () => setGlobalLoading(false)
  });

  const updateMutation = trpc.facility.update.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.facility.list.invalidate();
      setEditTarget(null);
    },
    onSettled: () => setGlobalLoading(false)
  });

  const deactivateMutation = trpc.facility.deactivate.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.facility.list.invalidate();
    },
    onSettled: () => setGlobalLoading(false)
  });

  const sortedFacilities = useMemo(() => {
    if (!Array.isArray(facilities)) {
      return [];
    }
    return [...facilities].sort((a, b) => a.code.localeCompare(b.code));
  }, [facilities]);

  const paginatedFacilities = useMemo(
    () => paginate(sortedFacilities, page, rowsPerPage),
    [sortedFacilities, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [searchKeyword, searchCategory, searchStatus, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadCsv = () => {
    if (!sortedFacilities || sortedFacilities.length === 0) return;
    const rows = sortedFacilities.map((facility) => [
      facility.code,
      facility.name,
      facility.category,
      facility.status,
      facility.prefecture ?? "",
      facility.city ?? "",
      facility.phoneNumber ?? "",
      facility.email ?? ""
    ]);
    const csv = buildCsvContent([CSV_HEADERS, ...rows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "facilities.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const onSubmitCreate = handleCreateSubmit((values) => {
    createMutation.mutate({
      code: values.code.trim(),
      name: values.name.trim(),
      nameKana: toOptional(values.nameKana),
      category: values.category,
      status: values.status,
      prefecture: toOptional(values.prefecture),
      city: toOptional(values.city),
      addressLine1: toOptional(values.addressLine1),
      postalCode: toOptional(values.postalCode),
      phoneNumber: toOptional(values.phoneNumber),
      email: toOptional(values.email),
      contactName: toOptional(values.contactName),
      contactPhone: toOptional(values.contactPhone),
      contactEmail: toOptional(values.contactEmail),
      startDate: toDateValue(values.startDate),
      endDate: toDateValue(values.endDate),
      capacity: toOptionalNumber(values.capacity),
      note: toOptional(values.note),
      imageUrl: toOptional(values.imageUrl),
      displayOrder: toOptionalNumber(values.displayOrder),
      isIntegrated: Boolean(values.isIntegrated)
    });
  });

  const onSubmitEdit = handleEditSubmit((values) => {
    if (!editTarget) return;
    updateMutation.mutate({
      id: editTarget.id,
      name: values.name.trim(),
      nameKana: toNullable(values.nameKana),
      category: values.category,
      status: values.status,
      prefecture: toNullable(values.prefecture),
      city: toNullable(values.city),
      addressLine1: toNullable(values.addressLine1),
      postalCode: toNullable(values.postalCode),
      phoneNumber: toNullable(values.phoneNumber),
      email: toNullable(values.email),
      contactName: toNullable(values.contactName),
      contactPhone: toNullable(values.contactPhone),
      contactEmail: toNullable(values.contactEmail),
      startDate: toDateOrNull(values.startDate),
      endDate: toDateOrNull(values.endDate),
      capacity: toNullableNumber(values.capacity),
      note: toNullable(values.note),
      imageUrl: toNullable(values.imageUrl),
      displayOrder: toNullableNumber(values.displayOrder),
      isIntegrated: Boolean(values.isIntegrated)
    });
  });

  const handleDeactivate = (facility: Facility) => {
    if (!window.confirm(`${facility.name} を無効化しますか？`)) {
      return;
    }
    deactivateMutation.mutate({
      id: facility.id,
      endDate: new Date()
    });
  };

  const handleOpenCreate = () => {
    resetCreateForm(createDefaultValues);
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
  };

  const handleCloseEdit = () => {
    setEditTarget(null);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            施設一覧
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isFetching}>
              再読み込み
            </Button>
            <Button variant="outlined" onClick={handleDownloadCsv} disabled={!sortedFacilities || sortedFacilities.length === 0}>
              CSV ダウンロード
            </Button>
            <Button variant="contained" onClick={handleOpenCreate}>
              施設追加
            </Button>
          </Stack>
        </Stack>
        <FacilityTableFilters
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          category={searchCategory}
          onCategoryChange={setSearchCategory}
          status={searchStatus}
          onStatusChange={setSearchStatus}
        />
      </Stack>

      {isLoading ? (
        <TableSkeleton rows={rowsPerPage} columns={8} />
      ) : sortedFacilities.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography align="center">条件に一致する施設が見つかりません。</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>施設コード</TableCell>
                <TableCell>施設名称</TableCell>
                <TableCell>種別</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>所在地</TableCell>
                <TableCell>代表電話</TableCell>
                <TableCell>代表メール</TableCell>
                <TableCell>担当者</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFacilities.map((facility) => (
                <TableRow key={facility.id} hover>
                  <TableCell>{facility.code}</TableCell>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{facility.category}</TableCell>
                  <TableCell>{facility.status}</TableCell>
                  <TableCell>
                    {facility.prefecture ?? "-"}
                    {facility.city ? ` ${facility.city}` : ""}
                  </TableCell>
                  <TableCell>{facility.phoneNumber ?? "-"}</TableCell>
                  <TableCell>{facility.email ?? "-"}</TableCell>
                  <TableCell>{facility.contactName ?? "-"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton aria-label="edit" size="small" onClick={() => setEditTarget(facility)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="deactivate"
                        size="small"
                        onClick={() => handleDeactivate(facility)}
                        disabled={deactivateMutation.isLoading}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={sortedFacilities.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={TABLE_ROWS_PER_PAGE_OPTIONS}
          />
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="md">
        <form onSubmit={onSubmitCreate}>
          <DialogTitle>施設追加</DialogTitle>
          <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto", pt: 1 }}>
            <Stack spacing={2} mt={1}>
              {createMutation.isError && <Alert severity="error">{createMutation.error.message}</Alert>}
              <TextField
                label="施設コード"
                {...registerCreate("code")}
                error={Boolean(createErrors.code)}
                helperText={createErrors.code?.message}
              />
              <TextField
                label="施設名称"
                {...registerCreate("name")}
                error={Boolean(createErrors.name)}
                helperText={createErrors.name?.message}
              />
              <TextField
                label="施設名称（カナ）"
                placeholder="フリガナ"
                {...registerCreate("nameKana")}
                error={Boolean(createErrors.nameKana)}
                helperText={createErrors.nameKana?.message}
              />
              <TextField
                label="種別"
                select
                defaultValue={createDefaultValues.category}
                {...registerCreate("category")}
                error={Boolean(createErrors.category)}
                helperText={createErrors.category?.message}
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ステータス"
                select
                defaultValue={createDefaultValues.status}
                {...registerCreate("status")}
                error={Boolean(createErrors.status)}
                helperText={createErrors.status?.message}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="都道府県"
                {...registerCreate("prefecture")}
                error={Boolean(createErrors.prefecture)}
                helperText={createErrors.prefecture?.message}
              />
              <TextField
                label="市区町村"
                {...registerCreate("city")}
                error={Boolean(createErrors.city)}
                helperText={createErrors.city?.message}
              />
              <TextField
                label="郵便番号"
                placeholder="123-4567"
                {...registerCreate("postalCode")}
                error={Boolean(createErrors.postalCode)}
                helperText={createErrors.postalCode?.message}
              />
              <TextField
                label="住所詳細"
                {...registerCreate("addressLine1")}
                error={Boolean(createErrors.addressLine1)}
                helperText={createErrors.addressLine1?.message}
              />
              <TextField
                type="date"
                label="稼働開始日"
                InputLabelProps={{ shrink: true }}
                {...registerCreate("startDate")}
                error={Boolean(createErrors.startDate)}
                helperText={createErrors.startDate?.message}
              />
              <TextField
                type="date"
                label="稼働終了日"
                InputLabelProps={{ shrink: true }}
                {...registerCreate("endDate")}
                error={Boolean(createErrors.endDate)}
                helperText={createErrors.endDate?.message}
              />
              <TextField
                label="収容人数／定員"
                inputMode="numeric"
                {...registerCreate("capacity")}
                error={Boolean(createErrors.capacity)}
                helperText={createErrors.capacity?.message}
              />
              <TextField
                label="代表電話番号"
                {...registerCreate("phoneNumber")}
                error={Boolean(createErrors.phoneNumber)}
                helperText={createErrors.phoneNumber?.message}
              />
              <TextField
                label="代表メールアドレス"
                type="email"
                {...registerCreate("email")}
                error={Boolean(createErrors.email)}
                helperText={createErrors.email?.message}
              />
              <TextField
                label="担当者氏名"
                {...registerCreate("contactName")}
                error={Boolean(createErrors.contactName)}
                helperText={createErrors.contactName?.message}
              />
              <TextField
                label="担当者電話番号"
                {...registerCreate("contactPhone")}
                error={Boolean(createErrors.contactPhone)}
                helperText={createErrors.contactPhone?.message}
              />
              <TextField
                label="担当者メールアドレス"
                type="email"
                {...registerCreate("contactEmail")}
                error={Boolean(createErrors.contactEmail)}
                helperText={createErrors.contactEmail?.message}
              />
              <TextField
                label="プロフィール画像 URL"
                placeholder="https://example.com/facility.png"
                {...registerCreate("imageUrl")}
                error={Boolean(createErrors.imageUrl)}
                helperText={createErrors.imageUrl?.message}
              />
              <TextField
                label="表示順"
                inputMode="numeric"
                {...registerCreate("displayOrder")}
                error={Boolean(createErrors.displayOrder)}
                helperText={createErrors.displayOrder?.message}
              />
              <TextField
                label="備考"
                multiline
                minRows={3}
                {...registerCreate("note")}
                error={Boolean(createErrors.note)}
                helperText={createErrors.note?.message}
              />
              <Controller
                control={createControl}
                name="isIntegrated"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="外部システム連携済み"
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper" }}>
            <Button onClick={handleCloseCreate}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isLoading}>
              保存
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(editTarget)} onClose={handleCloseEdit} fullWidth maxWidth="md">
        <form onSubmit={onSubmitEdit}>
          <DialogTitle>施設編集</DialogTitle>
          <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto", pt: 1 }}>
            <Stack spacing={2} mt={1}>
              {updateMutation.isError && <Alert severity="error">{updateMutation.error.message}</Alert>}
              <TextField label="施設コード" value={editTarget?.code ?? ""} disabled helperText="施設コードは編集できません" />
              <TextField
                label="施設名称"
                {...registerEdit("name")}
                error={Boolean(editErrors.name)}
                helperText={editErrors.name?.message}
              />
              <TextField
                label="施設名称（カナ）"
                {...registerEdit("nameKana")}
                error={Boolean(editErrors.nameKana)}
                helperText={editErrors.nameKana?.message}
              />
              <TextField
                label="種別"
                select
                defaultValue={editDefaultValues.category}
                {...registerEdit("category")}
                error={Boolean(editErrors.category)}
                helperText={editErrors.category?.message}
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ステータス"
                select
                defaultValue={editDefaultValues.status}
                {...registerEdit("status")}
                error={Boolean(editErrors.status)}
                helperText={editErrors.status?.message}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="都道府県"
                {...registerEdit("prefecture")}
                error={Boolean(editErrors.prefecture)}
                helperText={editErrors.prefecture?.message}
              />
              <TextField
                label="市区町村"
                {...registerEdit("city")}
                error={Boolean(editErrors.city)}
                helperText={editErrors.city?.message}
              />
              <TextField
                label="郵便番号"
                {...registerEdit("postalCode")}
                error={Boolean(editErrors.postalCode)}
                helperText={editErrors.postalCode?.message}
              />
              <TextField
                label="住所詳細"
                {...registerEdit("addressLine1")}
                error={Boolean(editErrors.addressLine1)}
                helperText={editErrors.addressLine1?.message}
              />
              <TextField
                type="date"
                label="稼働開始日"
                InputLabelProps={{ shrink: true }}
                {...registerEdit("startDate")}
                error={Boolean(editErrors.startDate)}
                helperText={editErrors.startDate?.message}
              />
              <TextField
                type="date"
                label="稼働終了日"
                InputLabelProps={{ shrink: true }}
                {...registerEdit("endDate")}
                error={Boolean(editErrors.endDate)}
                helperText={editErrors.endDate?.message}
              />
              <TextField
                label="収容人数／定員"
                inputMode="numeric"
                {...registerEdit("capacity")}
                error={Boolean(editErrors.capacity)}
                helperText={editErrors.capacity?.message}
              />
              <TextField
                label="代表電話番号"
                {...registerEdit("phoneNumber")}
                error={Boolean(editErrors.phoneNumber)}
                helperText={editErrors.phoneNumber?.message}
              />
              <TextField
                label="代表メールアドレス"
                type="email"
                {...registerEdit("email")}
                error={Boolean(editErrors.email)}
                helperText={editErrors.email?.message}
              />
              <TextField
                label="担当者氏名"
                {...registerEdit("contactName")}
                error={Boolean(editErrors.contactName)}
                helperText={editErrors.contactName?.message}
              />
              <TextField
                label="担当者電話番号"
                {...registerEdit("contactPhone")}
                error={Boolean(editErrors.contactPhone)}
                helperText={editErrors.contactPhone?.message}
              />
              <TextField
                label="担当者メールアドレス"
                type="email"
                {...registerEdit("contactEmail")}
                error={Boolean(editErrors.contactEmail)}
                helperText={editErrors.contactEmail?.message}
              />
              <TextField
                label="プロフィール画像 URL"
                {...registerEdit("imageUrl")}
                error={Boolean(editErrors.imageUrl)}
                helperText={editErrors.imageUrl?.message}
              />
              <TextField
                label="表示順"
                inputMode="numeric"
                {...registerEdit("displayOrder")}
                error={Boolean(editErrors.displayOrder)}
                helperText={editErrors.displayOrder?.message}
              />
              <TextField
                label="備考"
                multiline
                minRows={3}
                {...registerEdit("note")}
                error={Boolean(editErrors.note)}
                helperText={editErrors.note?.message}
              />
              <Controller
                control={editControl}
                name="isIntegrated"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="外部システム連携済み"
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper" }}>
            <Button onClick={handleCloseEdit}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={updateMutation.isLoading}>
              更新
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};
