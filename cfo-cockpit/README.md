---
title: "CFO Planning Cockpit"
description: "Scenario-driven financial planning dashboard with composable report builder, featuring scenario switching, global filters, and a guided/advanced report composer built on Luzmo ACK and Angular."
tags:
  - API
  - Dashboard
  - Grid
  - Editing
  - Angular
  - TypeScript
  - Scenario Planning
author: "Luzmo"
image: "./screenshot.png"
---

# CFO Planning Cockpit

![CFO Planning Cockpit](./screenshot.png)

Scenario-driven financial planning experience built on [Luzmo ACK](https://www.npmjs.com/package/@luzmo/analytics-components-kit) and Angular 17.

## Features

- **Scenario switching** — Base, Stretch, and Stress planning cases with context-aware board narrative
- **Global filters** — period, region, business unit, legal entity, and currency
- **Report composer** — 48-column grid with drag-and-drop repositioning and per-tile resize
- **Guided mode** — add/remove pre-configured KPI modules from a report library
- **Advanced mode** — configure data slots, switch chart types, edit styling
- **Version control** — save/restore named layout snapshots
- **Light and dark themes**

## Getting Started

1. Clone and install:

   ```bash
   git clone https://github.com/luzmo-official/flex-showcases.git
   cd flex-showcases/cfo-cockpit
   npm install
   ```

2. Set your Luzmo **embed** credentials (not API key/token). You can find these in your Luzmo account under Embed > Security. Add a script tag in `src/index.html` before `</head>`:

   ```html
   <script>
     window.__LUZMO_AUTH_KEY__ = 'your-embed-key';
     window.__LUZMO_AUTH_TOKEN__ = 'your-embed-token';
   </script>
   ```

   > **Warning:** Do not use your API key/token here. API credentials grant full backend access and must never be exposed in frontend code. Embed credentials are scoped to dashboard rendering only.

3. Start the dev server:

   ```bash
   npm start
   ```

   Open [http://localhost:3001](http://localhost:3001).

## Build

```bash
npm run build
```
