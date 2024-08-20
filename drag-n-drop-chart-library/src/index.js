import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from '@mui/material';
import Theme from "./Reference/Theme";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={Theme}>
    <CssBaseline />
      <App />
    </ThemeProvider>
  </StyledEngineProvider>
);
