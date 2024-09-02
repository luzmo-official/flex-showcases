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
  Typography,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DevicesIcon from "@mui/icons-material/Devices";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";

import "./Topnav.css";
import { mockUsers, useUser } from "../../services/UserService";
import { User } from "../../types/types";
import { useTheme } from "@mui/material/styles";

const TAB_STYLING = {
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
  minWidth: 60,
};

export default function Topnav({
  selectedTab,
  onTabChange,
}: {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}) {
  const { user, switchUser } = useUser();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserChange = (user: User) => {
    handleClose();
    switchUser(user);
  };

  return (
    <Box>
      <AppBar
        color="secondary"
        elevation={1}
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        }}
        className="topnav"
      >
        <Toolbar>
          <Box style={{ display: "flex" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="logo"
              sx={{
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "&:active": {
                  backgroundColor: "transparent",
                },
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              <DirectionsRunIcon />
              <Typography variant="h5" component="i">
                Healthosia
              </Typography>
            </IconButton>
          </Box>
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
              ".MuiTabs-flexContainer": {
                flexWrap: "wrap",
              },
            }}
            centered={true}
          >
            <Tab
              value="analytics"
              // label="Analytics"
              label={
                <Typography
                  sx={{ [theme.breakpoints.down("xs")]: { display: "none" } }}
                >
                  Analytics
                </Typography>
              }
              sx={TAB_STYLING}
              icon={<AnalyticsIcon />}
            />
            <Tab
              value="connect"
              // label="Connect"
              label={
                <Typography
                  sx={{ [theme.breakpoints.down("xs")]: { display: "none" } }}
                >
                  Connect
                </Typography>
              }
              sx={TAB_STYLING}
              icon={<DevicesIcon />}
              disabled
            />
            <Tab
              value="upload"
              // label="Upload"
              label={
                <Typography
                  sx={{ [theme.breakpoints.down("xs")]: { display: "none" } }}
                >
                  Upload
                </Typography>
              }
              sx={TAB_STYLING}
              icon={<CloudUploadIcon />}
              disabled
            />
            <Tab
              value="settings"
              // label="Settings"
              label={
                <Typography
                  sx={{ [theme.breakpoints.down("xs")]: { display: "none" } }}
                >
                  Settings
                </Typography>
              }
              sx={TAB_STYLING}
              icon={<SettingsIcon />}
            />
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
                  onClick={() => handleUserChange(u)}
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
