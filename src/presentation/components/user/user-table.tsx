"use client";

import { Button, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { type ChangeEvent, useEffect, useMemo, useState } from "react";
import type { User, UserRole } from "@/domain/entities/user";
import { trpc } from "@/infrastructure/trpc/client";
import { UserTableFilters } from "./user-table/user-table.filters";
import { CSV_HEADERS, TABLE_ROWS_PER_PAGE_OPTIONS } from "./user-table/user-table.consts";
import { buildCsvContent, paginate } from "./user-table/user-table.utils";
import { UserCreateDialog } from "./user-table/user-create-dialog";
import { UserEditDialog } from "./user-table/user-edit-dialog";
import { UserTableView } from "./user-table/user-table.view";
import type { CreateUserFormValues, EditUserFormValues } from "./user-table/user-table.validation";
import { GlobalLoading, TableSkeleton } from "@/presentation/components/common";

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

const TABLE_ROWS_PER_PAGE_DEFAULT = TABLE_ROWS_PER_PAGE_OPTIONS[1] ?? 10;

export const UserTable = () => {
  const utils = trpc.useUtils();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchRole, setSearchRole] = useState<"ALL" | UserRole>("ALL");
  const [globalLoading, setGlobalLoading] = useState(false);

  const {
    data: users,
    isLoading,
    isFetching,
    refetch,
  } = trpc.user.list.useQuery({
    keyword: searchKeyword || undefined,
    role: searchRole === "ALL" ? undefined : searchRole,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(TABLE_ROWS_PER_PAGE_DEFAULT);

  const createMutation = trpc.user.create.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.user.list.invalidate();
      setCreateOpen(false);
    },
    onSettled: () => setGlobalLoading(false),
  });
  const updateMutation = trpc.user.update.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.user.list.invalidate();
      setEditTarget(null);
    },
    onSettled: () => setGlobalLoading(false),
  });
  const deleteMutation = trpc.user.delete.useMutation({
    onMutate: () => setGlobalLoading(true),
    onSuccess: async () => {
      await utils.user.list.invalidate();
    },
    onSettled: () => setGlobalLoading(false),
  });

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const paginatedUsers = useMemo(() => paginate(sortedUsers, page, rowsPerPage), [sortedUsers, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [searchKeyword, searchRole, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadCsv = () => {
    if (!sortedUsers || sortedUsers.length === 0) return;
    const rows = sortedUsers.map((user) => [user.name, user.email, user.role, user.status, user.department ?? "", user.title ?? "", user.phoneNumber ?? ""]);
    const csv = buildCsvContent([CSV_HEADERS, ...rows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = async (values: CreateUserFormValues) => {
    await createMutation.mutateAsync({
      email: values.email.trim(),
      name: values.name.trim(),
      nameKana: toOptional(values.nameKana),
      role: values.role,
      status: values.status,
      department: toOptional(values.department),
      title: toOptional(values.title),
      phoneNumber: toOptional(values.phoneNumber),
      image: toOptional(values.image),
      note: toOptional(values.note),
    });
  };

  const handleEditSubmit = async (values: EditUserFormValues) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      name: values.name.trim(),
      nameKana: toNullable(values.nameKana),
      role: values.role,
      status: values.status,
      department: toNullable(values.department),
      title: toNullable(values.title),
      phoneNumber: toNullable(values.phoneNumber),
      image: toNullable(values.image),
      note: toNullable(values.note),
    });
  };

  const handleDelete = (user: User) => {
    if (!window.confirm(`${user.name} を削除しますか？`)) return;
    deleteMutation.mutate({ id: user.id });
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2">
              ユーザー一覧
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isFetching}>
                再読み込み
              </Button>
              <Button variant="outlined" onClick={handleDownloadCsv} disabled={!sortedUsers || sortedUsers.length === 0}>
                CSV ダウンロード
              </Button>
              <Button variant="contained" onClick={() => setCreateOpen(true)}>
                ユーザー追加
              </Button>
            </Stack>
          </Stack>

          <UserTableFilters keyword={searchKeyword} onKeywordChange={setSearchKeyword} role={searchRole} onRoleChange={setSearchRole} />
        </Stack>

        {isLoading ? (
          <TableSkeleton rows={rowsPerPage} columns={7} />
        ) : (
          <UserTableView
            users={paginatedUsers}
            totalCount={sortedUsers.length}
            page={page}
            rowsPerPage={rowsPerPage}
            isLoading={false}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onEdit={(user) => setEditTarget(user)}
            onDelete={handleDelete}
          />
        )}
      </Stack>

      <GlobalLoading open={globalLoading} />

      <UserCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isLoading}
        errorMessage={createMutation.error?.message}
      />

      <UserEditDialog
        open={Boolean(editTarget)}
        targetUser={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isLoading}
        errorMessage={updateMutation.error?.message}
      />
    </>
  );
};
