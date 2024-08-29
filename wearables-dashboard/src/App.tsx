import { useState } from "react";

import { Grid, Box, createTheme, ThemeProvider } from "@mui/material";

import { Topnav } from "./components";

const theme = createTheme({
  typography: {
    fontFamily: "Lato",
  },
  palette: {
    primary: {
      main: "#6440EB",
    },
    secondary: {
      main: "#fefefe",
    },
    // background color for the entire app
    background: {
      default: "#f4f5fd",
    },
  },
});

import "./App.css";
import { Settings } from "./components/Settings/Settings";
import Analytics from "./components/Analytics/Analytics";
import { UserContext, mockUsers } from "./services/UserService";
import { User } from "./types/types";

function App() {
  const [selectedTab, setSelectedTab] = useState("analytics");
  const [user, setUser] = useState<User>(mockUsers[0]);

  const switchUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <>
      <UserContext.Provider value={{ user, switchUser }}>
        <ThemeProvider theme={theme}>
          <Box bgcolor="background.default" minHeight="100vh">
            <Topnav selectedTab={selectedTab} onTabChange={setSelectedTab} />
            <Grid container spacing={2} padding={2}>
              {selectedTab === "analytics" && <Analytics />}
              {selectedTab === "settings" && (
                <Grid item xs={12}>
                  <Box padding={2}>
                    <Settings />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </ThemeProvider>
      </UserContext.Provider>
    </>
  );
}

export default App;
