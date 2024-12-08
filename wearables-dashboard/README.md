---
title: "Personal health tracker"
description: "An interactive app showing personalized health insights for different users."
tags:
  - flex
author: "Luzmo"
image: "https://cdn.prod.website-files.com/64be9847db6f59a691b3503f/66cf414014a4d42e3957cf87_wearables-dashboard.png"
url: "https://showcases.luzmo.com/wearables-dashboard"
---

# Luzmo Flex showcase: wearables insights

## About the Application

This application is a mock "Wearables insights" application, built with Luzmo, React and Material-UI (MUI). It allows users to gain insights into the data generated by their specific wearables, using Luzmo's Flex SDK to dynamically visualize the relevant widgets.

## Dependencies

- [React](https://react.dev/)
- [Material-UI (MUI)](https://mui.com/material-ui/getting-started/): A popular React UI framework that provides pre-built components and styling.
- _\[optional, fast alternative to `npm`\]_ [Bun](https://bun.sh/): an all-in-one JavaScript runtime & toolkit designed for speed, complete with a bundler, test runner, and Node.js-compatible package manager.

## Installation

To install and run the application, follow these steps:

1. Install the dependencies using bun or npm:

```bash
bun install
```
or
```bash
npm install
```

## Running the Application

To run the application, you have two options:

### Option 1: Using bun (Fast! 🚀)

1. Install bun globally (if not already installed):

```bash
npm install -g bun
```

2. Start the application using `bun`:

```bash
bun start
```

### Option 2: Using npm

1. Start the application using `npm`:

```bash
npm start
```

## Accessing the Application

Once the application is running, you can access it in your web browser at `http://localhost:5173`.

# (_**to be checked if useful or not**_) Default README content

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json", "./tsconfig.app.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
