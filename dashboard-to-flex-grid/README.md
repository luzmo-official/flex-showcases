---
title: "Dashboard to Flex grid"
description: "Embed a dashboard as individual Flex components, complete with responsive grid"
tags:
  - API
  - Dashboard
  - Flex
author: "Luzmo"
image: "..."
url: "https://stackblitz.com/github.com/luzmo-official/flex-showcases/tree/main/dashboard-to-flex-grid?embed=1&file=README.md&hideNavigation=1&view=preview"
---

# Embed a Luzmo Dashboard as Flex elements in a CSS grid

Open the project in StackBlitz to get started:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github.com/luzmo-official/flex-showcases/tree/main/dashboard-to-flex-grid?embed=1&file=README.md&hideNavigation=1&view=preview)

## Features

- Embed any dashboard designed in Luzmo Studio
- Responsive and/or fixed width dashboards
- Synced and/or unsynced responsive dashboards
- Cross-visualization filters as condigured in Luzmo Studio
- Display theme settings, including grid gap width
- Full front-end control over the grid and its vializations
- Vizualization options and slots can be manipualted programmatically

## How it works

Dashboards can be build in Luzmo Studio as usual.

[Luzmo's Core API](https://developer.luzmo.com/api/searchDashboard) is used to fetch the visualizations and layout of a given dashboard, based on its ID.

[Luzmo Flex components](https://developer.luzmo.com/guide/flex--introduction) are used to embed the dashboard as it's individual components.

A [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) is used to position visualizations in a grid. It's configured to be identical to the grid configured in Luzmo Studio for the given dashboard.

This example does not persist user changes. In a production environment, you should save grid modifications made by individual users. One option is to [store the edited Luzmo dashboard](https://developer.luzmo.com/api/createDashboard) as a variant with access for a [specific user](https://developer.luzmo.com/api/associateDashboard?exampleSection=DashboardAssociateAssociateDashboardVariantToParentRequestBody).

## Optional extensions

- A Flex-based implementation allows you to overwrite [options and slots](https://developer.luzmo.com/guide/flex--component-api-reference#slots-and-options) of individual charts programmatically. For example, to add a formula that simulates new product pricing as submitted by your user.
- A Flex-based implementation allows you to alter the grid programmatically. For example, to hide/show charts for specific users.

## Technology Stack

- HTML5, CSS (Baseline May 2024), Typescript, and Vite
- [Luzmo Flex Components](https://developer.luzmo.com/guide/flex--introduction)
- [Luzmo Core API](https://developer.luzmo.com/guide/api--introduction)

## Getting Started

### Prerequisites

- A Luzmo account with API and Flex access

### Installation

1. Clone the repository

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

### Customization

- Change the dashboard ID's in `config/config.ts`
- Update the embed tokens in the `.env.development` file, or add your own `.env` files.
- Note the title from the original dashboard is omitted. This could be easily derrived from the API return privded by `fetchDashboardRow`.
