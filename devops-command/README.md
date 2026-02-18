---
title: "DevOps Command"
description: "Analytics for Engineering teams in a cyber-themed command centre: monitor bug queues and PR health, with on-demand chart generation."
tags:
  - Angular
  - Node.js
  - AI
  - Flex
author: "Luzmo"
image: "https://i.imgur.com/95MX7Gy.png"
---

# DevOps Command

Give engineering teams a real-time command centre for their bug backlog and PR health — complete with a terminal-style AI assistant that generates charts on demand.

## Features
- Live Luzmo Flex charts, tracking bug trends and PR merge velocity
- Slice and dice charts by date granularity, squad, dev, or repository with one click
- Conversational analytics in terminal style, powered by Luzmo IQ — ask a question, get an answer with a chart and optionally configure it further
- Secure embed credential generation via a lightweight Node.js backend

## Getting started

### Prerequisites
- Node.js `v22.13.0` (see `.nvmrc`)
- npm
- A Luzmo account with API credentials and a collection containing datasets for this demo.

### Install dependencies
From the repository root:

```bash
npm run install-all
```

### Configure the backend
1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in your Luzmo credentials and collection ID.

```dotenv
LUZMO_API_KEY=<your Luzmo API key>
LUZMO_API_TOKEN=<your Luzmo API token>
LUZMO_COLLECTION_ID=<your Luzmo collection ID>
LUZMO_API_URL=https://api.luzmo.com
```

### Run the app
From the repository root:

```bash
npm start
```

This starts:
- Backend on `http://localhost:3101` (embed endpoint: `POST /api/embed`)
- Frontend on `http://localhost:4200`

## Repository structure
- `frontend/`: Angular application
- `backend/`: Lightweight Node.js/Express API to generate embed credentials

## Demo data
- Used demo data lives in `backend/data/`:
  - `backend/data/bug_tickets_weekly.csv`
  - `backend/data/jira_tickets_table.csv`
  - `backend/data/pr_merges_weekly.csv`
- Scripts to generate this demo data live in `backend/scripts/`:
  - `backend/scripts/generate-bug-tickets-csv.js`
  - `backend/scripts/generate-jira-tickets-csv.js`
  - `backend/scripts/generate-pr-merges-csv.js`

To regenerate all CSVs:
```bash
cd backend
npm run generate:bug-tickets-csv
npm run generate:jira-tickets-csv
npm run generate:pr-merges-csv
```

If you want to use these CSVs to run this app locally, you need to:
- Upload the resulting CSVs to Luzmo.
- Ensure they are available in the collection configured in `backend/.env` (`LUZMO_COLLECTION_ID`).
- Update dataset/column IDs in `frontend/src/app/luzmo-constants.ts` to match those of your uploaded datasets.
