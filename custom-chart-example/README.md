---
title: "Custom chart example"
description: "A Luzmo Custom Chart, showing sales representatives and their deals in an interactive circular layout. Built with D3.js and TypeScript, featuring zoom/pan, filtering, and detailed tooltips."
tags:
  - Custom Chart
  - Chart
author: "Luzmo"
image: "https://cdn.prod.website-files.com/64be9847db6f59a691b3503f/6879ffdb9bd0a04f86116df5_customchart.png"
url: "https://app.luzmo.com/s/custom-charts-example-network-chart-zmanlony95a44r9l"
---

# Luzmo Custom Chart example: visualization of sales reps and their deals in a Network Graph

This is an example implementation of a Custom Chart that can be uploaded to Luzmo, to be then natively used in Luzmo dashboards.

The visualization displays sales representatives positioned in a circular layout with their deals shown as interactive circles around them.

## Installation

If you want to run and develop the chart locally:
- Clone our [Custom Chart Builder](https://github.com/luzmo-official/custom-chart-builder) development environment from GitHub.
- Copy the contents of the `custom-chart` folder in this project and paste and replace the contents of the `projects\custom-chart` folder in the Custom Chart Builder environment.
- Run `npm install` in the root folder of the Custom Chart Builder development environment to install all dependencies.
- Run `npm run start` to start the dev environment. You can now access the chart at `http://localhost:4200` *(also see the [Custom Chart Builder documentation](https://github.com/luzmo-official/custom-chart-builder?tab=readme-ov-file#quick-start) for more information)*.
- If you wish, you can now start editing the chart code in the `src` folder and see the changes live in the dev environment.

## Chart configuration

The chart expects the following data slots, configured in the `manifest.json` file:
- **Category**: Sales representative names
- **Name**: Deal names
- **Size**: Deal amounts (determines circle size)
- **Color**: Deal probability (determines color gradient)
- **Time**: Expected close dates (determines circle distance from sales rep)

## Chart features

- Deals are positioned based on expected close date and sized by deal amount
- Deal circles use a color gradient to represent win probability (red to green)
- Click on sales reps or deals to interactively filter, seamlessly interacting with other charts in Luzmo dashboards
- Navigate the visualization with smooth zoom and pan controls
- Rich tooltips show deal details on hover