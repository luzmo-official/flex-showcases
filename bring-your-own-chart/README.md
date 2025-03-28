---
title: "Bring your own chart"
description: "Create your own custom visualization powered by Luzmo queries, with full interactivity to other Luzmo charts."
tags:
  - Flex
  - Node.js
author: "Luzmo"
image: "https://s3.eu-west-1.amazonaws.com/static.cumul.io/showcases/byoc.png"
url: "https://stackblitz.com/edit/vitejs-vite-fob7ft?embed=1&view=preview"
---

# Luzmo Flex showcase: Bring Your Own Chart

The chart on the left is a standard donut chart, created using [Luzmo Flex](https://www.luzmo.com/flex). On the right, you see a fully custom bar chart visualization, developed in React. The bar chart's data is dynamically populated by querying Luzmo datasets through the Luzmo API [`data` endpoint](https://developer.luzmo.com/api/getData).

Maintaining bi-directional interactivity between these charts is seamless. For example, clicking a slice in the donut chart automatically filters the data displayed in the custom bar chart. This functionality is achieved by utilizing the `changedFilters` Flex [event](https://developer.luzmo.com/guide/flex--component-api-reference#event-changedfilters).

## Installation

To install and run the application, follow these steps:

1. Install the dependencies using npm:

```bash
npm install
```

## Running the Application

1. Start the application using `npm`:

```bash
npm dev
```

## Accessing the Application

Once the application is running, you can access it in your web browser at `http://localhost:5173`.
