import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField
} from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/domain/entities/user";
import {
  type EditUserFormValues,
  editDefaultValues,
  editUserFormSchema,
  roleOptions,
  statusOptions,
  toEditFormValues
} from "./user-table.validation";

interface UserEditDialogProps {
  open: boolean;
  targetUser: User | null;
  onClose: () => void;
  onSubmit: (values: EditUserFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
}

export const UserEditDialog = ({
  open,
  targetUser,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage
}: UserEditDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: editDefaultValues,
    mode: "onBlur"
  });

  useEffect(() => {
    if (open && targetUser) {
      reset(toEditFormValues(targetUser));
    }
  }, [open, targetUser, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    if (!targetUser) return;
    await onSubmit(values);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>ユーザー編集</DialogTitle>
        <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto", pt: 1 }}>
          <Stack spacing={2} mt={1}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField label="氏名" {...register("name")} error={Boolean(errors.name)} helperText={errors.name?.message} />
            <TextField
              label="氏名（カナ）"
              {...register("nameKana")}
              error={Boolean(errors.nameKana)}
              helperText={errors.nameKana?.message}
            />
            <TextField
              label="権限"
              select
              defaultValue={editDefaultValues.role}
              {...register("role")}
              error={Boolean(errors.role)}
              helperText={errors.role?.message}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="ステータス"
              select
              defaultValue={editDefaultValues.status}
              {...register("status")}
              error={Boolean(errors.status)}
              helperText={errors.status?.message}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="所属部署"
              {...register("department")}
              error={Boolean(errors.department)}
              helperText={errors.department?.message}
            />
            <TextField
              label="役職"
              {...register("title")}
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
            <TextField
              label="電話番号"
              {...register("phoneNumber")}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
            />
            <TextField
              label="プロフィール画像URL"
              {...register("image")}
              error={Boolean(errors.image)}
              helperText={errors.image?.message}
            />
            <TextField
              label="備考"
              multiline
              minRows={3}
              {...register("note")}
              error={Boolean(errors.note)}
              helperText={errors.note?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "background.paper" }}>
          <Button onClick={onClose}>キャンセル</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            更新
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
