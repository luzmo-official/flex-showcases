import { SyntheticEvent, MouseEvent, useState } from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

import "./Topnav.css";
import { mockUsers, useUser } from "../../services/UserService";

const TAB_STYLING = {
  "&:hover": {
    color: "#fff",
    opacity: 0.6,
  },
  "&.Mui-selected": {
    color: "#fff",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
};

export default function Topnav({
  selectedTab,
  onTabChange,
}: {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { user, switchUser } = useUser();
  // const [value, setValue] = useState(selectedTab);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    // setValue(newValue);
    onTabChange(newValue);
  };

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
      paddingBottom={2}
    >
      <AppBar position="static">
        <Toolbar>
          <Tabs
            value={selectedTab}
            onChange={handleChange}
            sx={{
              flexGrow: 1,
              "& .MuiTabs-indicator": {
                display: "flex",
                justifyContent: "center",
                backgroundColor: "transparent",
              },
              "& .MuiTabs-indicatorSpan": {
                maxWidth: 40,
                width: "100%",
                backgroundColor: "#635ee7",
              },
            }}
          >
            <Tab value="analytics" label="Analytics" sx={TAB_STYLING} />
            <Tab value="settings" label="Settings" sx={TAB_STYLING} />
          </Tabs>
          <Box>
            <Tooltip title={user?.name} arrow>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {mockUsers.map((u) => (
                <MenuItem
                  key={u.id}
                  onClick={() => switchUser(u)}
                  sx={{
                    backgroundColor: u.id === user?.id ? "#e5e5e5" : "inherit",
                  }}
                >
                  {u.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
