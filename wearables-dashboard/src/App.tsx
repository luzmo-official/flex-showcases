import { useState } from "react";

import { Grid, Box, createTheme, ThemeProvider } from "@mui/material";

import { Topnav } from "./components";

// Userflow is only necessary for the Luzmo hosted showcases
import userflow from "userflow.js";
userflow.init("ct_65z5oczamna45bveai47cpcbpe");
userflow.identifyAnonymous();

const theme = createTheme({
  typography: {
    fontFamily: "Lato",
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
          <Topnav selectedTab={selectedTab} onTabChange={setSelectedTab} />
          <Grid
            container
            spacing={2}
            paddingX={2}
            paddingBottom={2}
            class="userflow-wearables"
          >
            {selectedTab === "analytics" && <Analytics />}
            {selectedTab === "settings" && (
              <Grid item xs={12}>
                <Box padding={2}>
                  <Settings />
                </Box>
              </Grid>
            )}
          </Grid>
        </ThemeProvider>
      </UserContext.Provider>
    </>
  );
}

export default App;
