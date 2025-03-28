---
title: "React Chart Library"
description: "Make Luzmo dashboards editable by users with a chart library"
tags:
  - API
  - Dashboard
  - Editing
  - Flex
  - React
author: "Luzmo"
image: "https://cdn.luzmo.com/showcases/react-chart-library.png"
url: "https://stackblitz.com/~/github.com/luzmo-official/flex-showcases/react-chart-library"
---

# Luzmo Chart Library example for react

This app demonstrates how to embed a Luzmo dashboard that users can edit and extend with preconfigured charts from a chart library. It serves as a reference implementation for Luzmo customers who want to add editing capabilities to their embedded dashboards without exposing users to the complexity of creating charts through Luzmo's embedded dashboard editor.

Open the project in StackBlitz to get started:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/luzmo-official/flex-showcases/react-chart-library)

## Features

- Embed a Luzmo dashboard in an editable grid
- Connect a second Lumzo dashboard as a chart library
- Add charts to the grid from the chart library
- Fully customizable styling and theming

## How it works

[Luzmo's Core API](https://developer.luzmo.com/api/searchDataset) is used to fetch the charts and layout of a given dashboard.

[Luzmo Flex Components](https://developer.luzmo.com/guide/flex--introduction) are used to embed the dashboard as it's individual components. The `canFilter` property helps us to automatically handle interactivty between components, even if they are from different dashboards.

The third party library [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) is used to place charts in an editable grid. It's configured to be identical to the grid of Luzmo's dashboard editor.

This example does not persist user changes. In a production environment, you should implement server-side storage to save grid modifications made by individual users.

## Optional extensions

- Make a dashboard editable through Luzmo's embedded dashboard editor, for example to allow users to extend the chart library.
- Add a range of dashboards or collections to populate the chart library, instead of the single dashboard in this example.

## Technology Stack

- React + typescript + Vite
- [Luzmo Flex Components](https://developer.luzmo.com/guide/flex--introduction)
- [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Luzmo account with API access

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

- Change the dashboard ID's in `config/embed-token.ts`
- Update the embed token in your `.env` file.
