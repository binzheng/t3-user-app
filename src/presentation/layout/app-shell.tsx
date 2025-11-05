"use client";

import { ReactNode, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import GroupsIcon from "@mui/icons-material/Groups";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DashboardIcon from "@mui/icons-material/Dashboard";

interface AppShellProps {
  children: ReactNode;
  currentUserName?: string;
  onLogout?: () => void;
}

type NavItem = {
  label: string;
  icon: ReactNode;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "ユーザー管理", icon: <GroupsIcon />, href: "/" },
  { label: "施設マスタ", icon: <WarehouseIcon />, href: "/facilities" }
];

export const AppShell = ({ children, currentUserName = "管理者 太郎", onLogout }: AppShellProps) => {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const drawerWidth = 240;
  const collapsedDrawerWidth = 64;

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DashboardIcon color="primary" />
          {(isMobile || desktopOpen) && (
            <Typography variant="h6" fontWeight="bold">
              業務管理
            </Typography>
          )}
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                onClick={handleMenuClick}
                sx={{
                  justifyContent: (isMobile || desktopOpen) ? "initial" : "center",
                  px: isMobile || desktopOpen ? 2.5 : 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.dark"
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText"
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isMobile || desktopOpen ? 40 : 0, justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {(isMobile || desktopOpen) && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            業務管理ダッシュボード
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">{currentUserName}</Typography>
            <Button
              color="inherit"
              variant="outlined"
              size="small"
              onClick={onLogout}
              sx={{ borderColor: "rgba(255,255,255,0.5)" }}
            >
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: desktopOpen ? drawerWidth : collapsedDrawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          })
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth
            }
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden'
            }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          mt: 8,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
