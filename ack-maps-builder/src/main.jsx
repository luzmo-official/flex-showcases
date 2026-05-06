import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';

import '@luzmo/lucero/button';
import '@luzmo/lucero/button-group';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/action-group';
import '@luzmo/lucero/tabs';
import '@luzmo/lucero/accordion';
import '@luzmo/lucero/text-field';
import '@luzmo/lucero/search';
import '@luzmo/lucero/number-field';
import '@luzmo/lucero/select';
import '@luzmo/lucero/switch';
import '@luzmo/lucero/divider';
import '@luzmo/lucero/icon';
import '@luzmo/lucero/field-label';
import '@luzmo/lucero/progress-circle';
import '@luzmo/lucero/tooltip';
import '@luzmo/lucero/picker';
import '@luzmo/lucero/menu';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
