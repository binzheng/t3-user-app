"use client";

import { Backdrop, CircularProgress } from "@mui/material";

interface GlobalLoadingProps {
  open: boolean;
}

export const GlobalLoading = ({ open }: GlobalLoadingProps) => {
  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)"
      }}
    >
      <CircularProgress color="inherit" size={60} />
    </Backdrop>
  );
};
