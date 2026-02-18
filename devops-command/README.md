---
title: "DevOps Command"
description: "A control center for product engineering teams to monitor bug backlog and PR merge health through interactive embedded analytics and on-demand chart generation."
tags:
  - Angular
  - Node.js
  - AI
  - Flex
author: "Luzmo"
image: "https://i.imgur.com/95MX7Gy.png"
---

# DevOps Command

## Goal
Provide a command centre for product-engineering teams to monitor bug queue and PR health, with a terminal-style AI assistant for ad-hoc chart generation.

## Features
- Terminal-inspired UI with boot sequence and cyber-style theme
- Embedded Luzmo Flex charts for bug and PR analytics
- Interactive controls for date granularity, squad filtering, and PR level drilling
- AI terminal chat that streams Luzmo IQ responses and can generate charts dynamically
- Node.js backend endpoint for secure Luzmo embed credential generation

## Repository Structure
- `frontend/`: Angular application
- `backend/`: Express API, data CSVs, and dataset generation scripts

## Prerequisites
- Node.js `v22.13.0` (see `.nvmrc`)
- npm
- A Luzmo account with API credentials and a collection for this demo.

## Configure the Backend
1. Create `backend/config/local.js`.
2. Add your Luzmo API key and token and local port (default is 3101).

```js
module.exports = {
  luzmo: {
    apiToken: "<your Luzmo API token>",
    apiKey: "<your Luzmo API key>",
    collectionId: "<your Luzmo collection ID>",
    apiUrl: "https://api.luzmo.com",
  },
  port: 3101,
  local: true,
};
```

## Install Dependencies
From the repository root:

```bash
npm run install-all
```

## Data and Scripts
- Scripts to generators demo data live in `backend/scripts/`:
  - `backend/scripts/generate-bug-tickets-csv.js`
  - `backend/scripts/generate-jira-tickets-csv.js`
  - `backend/scripts/generate-pr-merges-csv.js`
- Resulting demo data lives in `backend/data/`:
  - `backend/data/bug_tickets_weekly.csv`
  - `backend/data/jira_tickets_table.csv`
  - `backend/data/pr_merges_weekly.csv`

To regenerate all CSVs:
```bash
cd backend
npm run generate:bug-tickets-csv
npm run generate:jira-tickets-csv
npm run generate:pr-merges-csv
```

Important:
- Upload the resulting CSVs to Luzmo.
- Ensure they are available in the collection configured in `backend/config/local.js` (`luzmo.collectionId`).
- Update dataset/column IDs in `frontend/src/app/luzmo-constants.ts` to match those of your uploaded datasets.

## Run the app
From the repository root:

```bash
npm start
```

This starts:
- Backend on `http://localhost:3101` (embed endpoint: `POST /api/embed`)
- Frontend on `http://localhost:4200`

## Frontend/Backend Connection Notes
- Frontend embed credential calls are hardcoded to `http://localhost:3101/api/embed` in `frontend/src/app/services/embed-auth.service.ts`.
- If you change the backend port, update that URL accordingly.
