---
title: "Luzmo Analyst for Microsoft Teams"
description: "A Microsoft Teams bot that answers data questions via Luzmo's hosted /AIPrompt API (agent: analyst), streams progress into the chat, and posts chart images when Luzmo returns a visualization."
tags:
  - Node.js
  - TypeScript
  - AI
author: "Luzmo"
url: "https://github.com/luzmo-official/showcases/tree/main/teamsbot"
---

# Luzmo Analyst for Microsoft Teams

A Microsoft Teams bot that answers data questions via Luzmo's hosted **`/AIPrompt`** API (`agent: analyst`), streams progress into the chat, and posts a chart image when Luzmo returns a visualization.

This is the Teams counterpart of the [Luzmo Analyst Slackbot](../slackbot).

## Prerequisites

- Node.js 20+
- Luzmo account with the **IQ addon** enabled (required for `agent: analyst`)
- Luzmo API key + token per authorized user (see `users.json`)
- A Microsoft Entra app registration and an Azure Bot with the Teams channel enabled
- A public HTTPS URL for the bot (dev tunnel or ngrok)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

3. Copy `users.json.example` to `users.json` and add authorized users:

```bash
cp users.json.example users.json
```

4. Start the bot:

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build && npm start
```

The messaging endpoint is `https://<your-host>/api/messages`.

## Azure Bot and Entra ID

1. In [Microsoft Entra admin center](https://entra.microsoft.com/), register an application.
   - Supported account type: **Accounts in this organizational directory only** (single tenant).
   - Create a client secret. `MicrosoftAppPassword` is the secret **value**, not the secret ID.
   - Copy the application (client) ID into `MicrosoftAppId` and the directory (tenant) ID into `MicrosoftAppTenantId`.
2. On that app, add a Microsoft Graph **application** permission: `User.Read.All`. Grant **admin consent**. The bot uses this to read the sender's `mail` (or `userPrincipalName` when mail is empty) and match it to `users.json`. The Teams roster API does not return email addresses.
3. In the [Azure portal](https://portal.azure.com/), create an **Azure Bot**.
   - Type: **Single Tenant**.
   - Use the Entra app ID from step 1.
   - Set `MicrosoftAppType` to `SingleTenant`.
4. On the bot, set the messaging endpoint to `https://<your-host>/api/messages`.
5. Open **Channels** and enable **Microsoft Teams**.

For a multi-tenant bot, set `MicrosoftAppType` to `MultiTenant` and leave `MicrosoftAppTenantId` empty. Graph lookups then use the tenant id on the incoming Teams activity. The Entra app still needs `User.Read.All` consented in each tenant that uses the bot.

## Public URL

Teams delivers activities over HTTPS, and chart images are loaded from this process.

```bash
# Microsoft dev tunnel
devtunnel user login
devtunnel host -p 3978 --allow-anonymous

# or ngrok
ngrok http 3978
```

Set `PUBLIC_BASE_URL` to that origin with no path, for example `https://abc123.euw.devtunnels.ms`. Chart PNGs are served from `/charts/:id` for one hour. Without `PUBLIC_BASE_URL`, the bot still answers in text and tries a Bot Connector image attachment as a fallback.

Anonymous tunnels are public. Use them for a demo, not as a long-lived place to keep production secrets.

## Teams app package

`appPackage/manifest.json` is a template. Package it after `MicrosoftAppId` and `PUBLIC_BASE_URL` are set so the bot id and image domain are filled in:

```bash
npm run package
```

This writes `luzmo-analyst-teams.zip`. In Teams, go to **Apps → Manage your apps → Upload an app → Upload a custom app**. The tenant must allow custom app upload. Re-package when the tunnel host changes, then upload the new zip.

## Configuration

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `MicrosoftAppId` | Yes | Entra application (client) ID |
| `MicrosoftAppPassword` | Yes | Entra client secret value |
| `MicrosoftAppType` | No | `SingleTenant` (default when a tenant id is set) or `MultiTenant` |
| `MicrosoftAppTenantId` | For single-tenant | Directory (tenant) ID |
| `PORT` | No | HTTP port (default `3978`) |
| `PUBLIC_BASE_URL` | For chart images | Public HTTPS origin of this bot |
| `DATASET_IDS` | Yes | Comma-separated dataset IDs pinned on each `/AIPrompt` call |
| `LUZMO_HOST` | No | Luzmo API host (defaults to `https://api.luzmo.com`) |
| `AIPROMPT_USE_EMBED_AUTH` | No | When `true` (default), mint scoped embed tokens per user for `/AIPrompt` |

### User permissions (`users.json`)

Each authorized user is mapped by email to their Luzmo API credentials:

```json
{
  "alice@company.com": {
    "luzmoKey": "your-luzmo-api-key",
    "luzmoToken": "your-luzmo-api-token"
  }
}
```

Matching is case-insensitive. If Graph returns no `mail`, the bot uses `userPrincipalName` (guest users often have an `#EXT#` address). Org credentials mint embed tokens (when enabled) and call the Luzmo Export API for chart PNGs. They are never sent to Teams clients.

Only users whose email appears in this file can use the bot. Unauthorized users receive a permission denied message.

## Usage

- **Personal chat:** open the app and ask `What are the top categories by revenue?`
- **Channel or group chat:** `@Luzmo Analyst What are the top categories by revenue?`

The bot will:

1. Verify the user's email against `users.json`
2. Post an "Analyzing your question…" card
3. Call `POST /0.1.0/aiprompt` with `agent: analyst` and update that card with progress and text
4. Replace the card with the final answer
5. Add the chart image when Luzmo returns an item asset

Follow-up messages continue the Luzmo `conversation_id` for one hour:

- In a **personal chat**, the whole chat is one conversation.
- In a **channel or group chat**, a new question must @mention the bot. Replies in that thread continue the same Luzmo conversation when Teams delivers them (with or without another mention).

The Bot Framework request is acknowledged as soon as the placeholder card is posted. Analysis then continues on that conversation, so a slow answer is not cut off by the channel timeout.

Conversation ids are kept in memory for one hour. Restarting the process, or running more than one instance, starts a fresh Luzmo conversation.

## Architecture

```
Teams → message-handler → aiprompt-client → Luzmo /AIPrompt
                        → chart-renderer → Teams
```

See [createAIPrompt.md](https://developer.luzmo.com/api/createAIPrompt.md) for the API reference.
