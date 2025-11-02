"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

const NAV_WIDTH = 240;

interface AppShellProps {
  children: ReactNode;
  currentUserName?: string;
}

const navItems = [
  {
    label: "ユーザー管理",
    href: "/",
    icon: <GroupsIcon fontSize="small" />
  },
  {
    label: "施設マスタ",
    href: "/facilities",
    icon: <WarehouseIcon fontSize="small" />
  }
] as const;

export const AppShell = ({ children, currentUserName = "管理者 太郎" }: AppShellProps) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedMap = useMemo(() => {
    return navItems.reduce<Record<string, boolean>>((acc, item) => {
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
      acc[item.href] = active;
      return acc;
    }, {});
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseDrawer = () => setMobileOpen(false);

  const navigation = (
    <Stack height="100%" spacing={2} py={3}>
      <Stack direction="row" spacing={1} alignItems="center" px={3}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
          <DashboardIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          管理コンソール
        </Typography>
      </Stack>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={selectedMap[item.href]}
            onClick={handleCloseDrawer}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Box px={3}>
        <Typography variant="caption" color="text.secondary">
          バージョン 1.0.0
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default" color="text.primary">
      <Box component="nav" sx={{ width: { md: NAV_WIDTH }, flexShrink: { md: 0 } }} aria-label="サイトメニュー">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: NAV_WIDTH }
          }}
        >
          {navigation}
        </Drawer>
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: NAV_WIDTH,
            flexShrink: 0,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            height: "100vh"
          }}
        >
          {navigation}
        </Box>
      </Box>

      <Box flexGrow={1} display="flex" flexDirection="column" minHeight="100vh">
        <Box
          component="header"
          px={{ xs: 2, md: 4 }}
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: (theme) => theme.zIndex.appBar
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton
                aria-label="メニューを開く"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: "inline-flex", md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton aria-label="dashboard" edge="start" sx={{ display: { xs: "none", md: "inline-flex" } }}>
                <DashboardIcon />
              </IconButton>
              <Typography variant="h6" component="div">
                業務管理ダッシュボード
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack spacing={0} textAlign="right">
                <Typography variant="body2" fontWeight="bold">
                  {currentUserName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ログイン中
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                sx={{ whiteSpace: "nowrap" }}
              >
                ログアウト
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box component="main" flexGrow={1} px={{ xs: 2, md: 4 }} py={3}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
