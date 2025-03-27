---
title: "React Luzmo IQ Playground"
description: "Test Luzmo IQ with your own data"
tags:
  - ai
  - luzmo-iq
  - flex
  - api
  - react
author: "Luzmo"
image: "https://cdn.luzmo.com/showcases/react-luzmo-iq-playground.png"
url: "https://stackblitz.com/~/github.com/luzmo-official/flex-showcases/react-luzmo-iq-playground"
---

# React Luzmo IQ Playground

This example project provides a quick way to test [Luzmo IQ](https://www.luzmo.com/iq) with your own data, while also demonstrating how to integrate it into your application.

Open the project in StackBlitz to get started:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/luzmo-official/flex-showcases/react-luzmo-iq-playground)

## What is Luzmo IQ?

**Turn any user into an analyst, with AI.**
Luzmo IQ provides instant, concise answers to any data question, backed by easy-to-understand charts. Empower your customers with faster, clearer insights by integrating Luzmo IQ as an AI-powered assistant, embedded search – or power your own app with our components and APIs.

[Learn more about Luzmo IQ →](https://www.luzmo.com/iq)

## Project structure

The example includes additional components to help you:

- Set a custom embed token for Luzmo IQ
- Verify dataset access and available rows
- Play with the Luzmo IQ chat interface

## Prerequisites

Before running this example, you'll need to:

1. **Enable Luzmo IQ for your account**\
   Contact your customer success manager or [support@luzmo.com](mailto:support@luzmo.com).

2. **Enable AI insights for your datasets**\
   Navigate to the dataset details page in Luzmo and enable the "AI insights" feature for each dataset you want to query with Luzmo IQ.

3. **Create authentication credentials**\
   Generate an embed key and token with "use" rights for your datasets through the [authorization API](https://developer.luzmo.com/api/createAuthorization).

## Quick Start

1. Clone this repository:

   ```bash
   git clone https://github.com/cumulio-internal/react-luzmo-iq-playground.git
   cd react-luzmo-iq-playground
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Integrating Luzmo IQ into your application

The essential part of integrating Luzmo IQ is the `LuzmoIQChatComponent`. Here's a minimal react example:

```
<LuzmoIQChatComponent
  appServer="< Luzmo App server, defaults to https://app.luzmo.com >"
  apiHost="< Luzmo API server, defaults to https://api.luzmo.com >"
  authKey="< Embed key >"
  authToken="< Embed token >"
  options="< Component customization options >"
/>
```

View other examples in the [Luzmo IQ documentation](https://developer.luzmo.com/guide/iq--introduction).

## Documentation

- [Luzmo IQ Introduction](https://developer.luzmo.com/guide/iq--introduction)
- [Luzmo IQ Chat Component API reference](https://developer.luzmo.com/guide/iq--chat-component-api)

## Support

If you have any questions or need assistance:

- Contact [support@luzmo.com](mailto:support@luzmo.com)
- Visit [luzmo.com](https://www.luzmo.com)
