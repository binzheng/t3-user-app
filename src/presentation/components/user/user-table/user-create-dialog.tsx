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
import {
  type CreateUserFormValues,
  createDefaultValues,
  createUserFormSchema,
  roleOptions,
  statusOptions
} from "./user-table.validation";

interface UserCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
}

export const UserCreateDialog = ({ open, onClose, onSubmit, isSubmitting, errorMessage }: UserCreateDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: createDefaultValues,
    mode: "onBlur"
  });

  useEffect(() => {
    if (open) {
      reset(createDefaultValues);
    }
  }, [open, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset(createDefaultValues);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>ユーザー追加</DialogTitle>
        <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto", pt: 1 }}>
          <Stack spacing={2} mt={1}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              label="メールアドレス"
              {...register("email")}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
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
              defaultValue={createDefaultValues.role}
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
              defaultValue={createDefaultValues.status}
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
            保存
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
