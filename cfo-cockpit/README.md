---
title: "CFO Planning Cockpit"
description: "Scenario-driven financial planning dashboard with composable report builder, featuring scenario switching, global filters, and a guided/advanced report composer built on Luzmo ACK and Angular."
tags:
  - API
  - Dashboard
  - Grid
  - Editing
  - Angular
  - Typescript
  - Scenario planning
author: "Luzmo"
image: "https://cdn.luzmo.com/showcases/cfo-cockpit.png"
url: "https://examples.luzmo.com/cfo-cockpit/"
---

# CFO Planning Cockpit

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

2. Set your Luzmo embed credentials. Add a script tag in `src/index.html` before `</head>`:

   ```html
   <script>
     window.__LUZMO_AUTH_KEY__ = 'your-embed-key';
     window.__LUZMO_AUTH_TOKEN__ = 'your-embed-token';
   </script>
   ```

3. Start the dev server:

   ```bash
   npm start
   ```

   Open [http://localhost:3001](http://localhost:3001).

## Build

```bash
npm run build
```
