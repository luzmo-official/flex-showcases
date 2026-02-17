---
title: "Sales Compass"
description: "A sales analytics app that demonstrates Luzmo's embedded analytics capabilities end-to-end: interactive dashboards, AI-powered summaries, a conversational analytics assistant, and a self-service report builder."
tags:
  - API
  - Angular
  - AI
  - Flex
  - Node.js
author: "Luzmo"
image: "https://i.imgur.com/2KqFURN.png"
url: "https://demo-app.luzmo.com/"
---

To run this app locally:
1. Create a local.cjs file in `backend/config`
2. Add the following config in `backend/config/local.cjs`. Use your Luzmo API credentials and your own collection ID.

```nodejs
module.exports = {
  luzmo: {
    apiToken: "<your Luzmo API key>",
    apiKey: "<your Luzmo API token>",
    collectionId: "33c447d5-06a7-4edc-bcce-c3c241987567",
    apiUrl: "<your Luzmo API URL (default: https://api.luzmo.com)>",
  },
  port: 3101,
  local: true,
};
```

3. Install dependencies and start both backend and frontend
```cmd
npm run install-all
npm start
```

**Note**: this project uses specific dataset, dashboard and chart id's through the code for the purpose of this demo. You can change these to point to your own datasets/dashboards/charts. Add the datasets and dashboards you want to use to a Collection in Luzmo and reference this collection ID in `backend/config/local.cjs`. 

Then, update specific IDs throughout the frontend (e.g. in `\frontend\src\app\constants\luzmo-constants.ts`) to make the charts render correctly.
