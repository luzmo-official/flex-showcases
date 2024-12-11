---
title: "Embedded AI Chart Generator"
description: "Click on a sample question or ask your own to create a chart, powered by AI."
tags:
  - ai
  - chart
  - flex
author: "Luzmo"
image: "https://cdn.prod.website-files.com/64be9847db6f59a691b3503f/66d84032abfc71dbb38bbcd7_embedded_ai_chart_generator.png"
url: "https://ai-showcases.luzmo.com/embedded-chart-generator"
---

# Luzmo Flex showcase: AI chart generator
A demo of an embedded AI chart generator using the Luzmo API and Luzmo Flex.

## Usage
To use this project, follow these steps:

1. Clone the repository to your local machine.
2. Create an `.env` file in the `backend` folder containing a the following info: <br>
  LUZMO_API_KEY=`<the luzmo api key>`<br>
  LUZMO_API_TOKEN=`<the luzmo api token>`<br>
3. Install the dependencies in frontend & backend folder by running `npm install`.
4. Create a local config file: `backend/config/local.cjs`
```
module.exports = {
  local: true,
  port: 4000,
  luzmo: {
      apiToken: '<your api token>',
      apiKey: '<your api key>',
  },
};
```
5. Run the backend `cd backend && node index.js`
6. Run the frontend `cd frontend && ng serve`
