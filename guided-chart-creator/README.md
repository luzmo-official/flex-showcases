---
title: "Composable Analytics Builder"
description: "Guide users through building charts and tables from raw data, then compose them into interactive dashboards"
tags:
  - API
  - Dashboard
  - Flex
  - Editing
  - ACK
  - React
  - Next.js
  - Typescript
author: "Luzmo"
image: "https://cdn.luzmo.com/showcases/guided-chart-creator-screenshots.png"
url: "https://examples.luzmo.com/guided-chart-creator/"
---

# Composable Analytics Builder

Guided end-user report builder powered by Luzmo ACK and Flex.

Users select data fields, pick a chart type, fine-tune options and filters, then drop the result onto a drag-and-drop dashboard grid. Two builder paths are available — a step-by-step chart wizard and a dedicated table/pivot builder — both producing live Flex visualisations.

## Features

- **Guided Chart Creator** — Four-step wizard: select data fields, pick a chart type, review a live preview, then refine config and filters before adding to the dashboard.
- **Tabular Report Builder** — Build regular tables and pivot tables with slot-based configuration for rows, columns, and measures. Pivot mode activates automatically when a row field is added.
- **Dashboard Grid** — `<luzmo-item-grid>` handles drag-and-drop layout, resize, clone, delete, and edit-in-place.
- **Smart Chart Type Defaults** — A heuristic selects the most appropriate chart type based on the measures and dimensions the user has chosen.
- **Live Preview** — Charts and tables render in real time via Luzmo Flex as users configure them.
- **Theming** — Light, dark, and retro (Windows 95) themes applied consistently across the app, ACK components, Flex charts, and the dashboard grid.

## Tech Stack

- **[Next.js](https://nextjs.org) 16** (App Router) — React 19
- **[Tailwind CSS 4](https://tailwindcss.com)** + Radix UI primitives — UI layer
- **[@luzmo/analytics-components-kit](https://www.npmjs.com/package/@luzmo/analytics-components-kit)** — Data field panel, slot drops, config editors, filters, dashboard grid
- **[@luzmo/react-embed](https://www.npmjs.com/package/@luzmo/react-embed)** — Flex chart rendering (`<luzmo-embed-viz-item>`)
- **TypeScript** throughout

## Getting Started

1. Copy `.env.example` to `.env.local` and configure your datasets:

   ```env
   NEXT_PUBLIC_LUZMO_DATASET_IDS=your-dataset-id-1,your-dataset-id-2
   ```

   No API keys or embed tokens are needed — the app works directly with public datasets.

2. Install and start:

   ```bash
   npm install
   npm run dev
   ```

The dev server starts at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Authentication

This showcase runs **without any authentication at runtime**. No API keys, embed tokens, or server-side token minting is required — it works because it targets public Luzmo datasets.

If you need to work with private or protected Luzmo resources, you would need to provide embed credentials (`authKey` / `authToken`) to the ACK and Flex components. See the [Luzmo authorisation guide](https://developer.luzmo.com/guide/dashboard-embedding--generating-an-authorization-token.md) for details.

## Further Reading

- [Luzmo Analytics Components Kit documentation](https://developer.luzmo.com)
- [Luzmo Flex embed documentation](https://developer.luzmo.com/flex)

See [AGENTS.md](./agents.md) for architecture rules and implementation guidelines.
