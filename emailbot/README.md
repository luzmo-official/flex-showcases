---
title: "Luzmo Analyst Email Bot"
description: "An email bot that answers data questions from specific senders via Luzmo's hosted /AIPrompt API (agent: analyst) and replies with the answer plus an inline chart image."
tags:
  - Node.js
  - TypeScript
  - AI
author: "Luzmo"
url: "https://github.com/luzmo-official/showcases/tree/main/emailbot"
---

# Luzmo Analyst Email Bot

An email bot that watches a mailbox, answers data questions from specific sender addresses via Luzmo's hosted **`/AIPrompt`** API (`agent: analyst`), and replies in the same thread with the answer and an inline chart image.

This is the email counterpart of the [Luzmo Analyst Slackbot](../slackbot) and the [WhatsApp Analyst](../whatsapp-analyst).

## Prerequisites

- Node.js 20+
- Luzmo account with the **IQ addon** enabled (required for `agent: analyst`)
- Luzmo API key + token per authorized sender (see `users.json`)
- A mailbox with IMAP and SMTP enabled (Gmail app password, or Microsoft 365 with IMAP and SMTP AUTH turned on)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in the mailbox:

```bash
cp .env.example .env
```

3. Copy `users.json.example` to `users.json` and list the sender addresses that may ask questions:

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

The process connects out over IMAP and idles on the mailbox. It does not need a public webhook.

## Mailbox

Use a dedicated mailbox for the bot. It answers mail whose **From** address is listed in `users.json` and ignores everyone else.

Gmail:

| Variable | Example |
|---|---|
| `IMAP_HOST` | `imap.gmail.com` |
| `IMAP_PORT` / `IMAP_SECURE` | `993` / `true` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` / `SMTP_SECURE` | `465` / `true` |

Create a Google app password and turn IMAP on for that account. Put the app password in both `IMAP_PASSWORD` and `SMTP_PASSWORD`.

Microsoft 365 / Outlook:

| Variable | Example |
|---|---|
| `IMAP_HOST` | `outlook.office365.com` |
| `IMAP_PORT` / `IMAP_SECURE` | `993` / `true` |
| `SMTP_HOST` | `smtp.office365.com` |
| `SMTP_PORT` / `SMTP_SECURE` | `587` / `false` |

The tenant must allow IMAP and authenticated SMTP for this mailbox. Basic auth is often disabled; use an app password or a mailbox where SMTP AUTH is enabled.

## Configuration

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `IMAP_HOST` | Yes | IMAP server hostname |
| `IMAP_PORT` | No | IMAP port (default `993`) |
| `IMAP_SECURE` | No | Use TLS (default `true`) |
| `IMAP_USER` | Yes | Mailbox address the bot reads |
| `IMAP_PASSWORD` | Yes | Mailbox password or app password |
| `IMAP_MAILBOX` | No | Folder to watch (default `INBOX`) |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_SECURE` | No | Use implicit TLS (default `false`; use `true` for port 465) |
| `SMTP_USER` | No | SMTP username (defaults to `IMAP_USER`) |
| `SMTP_PASSWORD` | No | SMTP password (defaults to `IMAP_PASSWORD`) |
| `SMTP_FROM` | No | From header (defaults to `IMAP_USER`) |
| `DATASET_IDS` | Yes | Comma-separated dataset IDs pinned on each `/AIPrompt` call |
| `LUZMO_HOST` | No | Luzmo API host (defaults to `https://api.luzmo.com`) |
| `AIPROMPT_USE_EMBED_AUTH` | No | When `true` (default), mint scoped embed tokens per sender for `/AIPrompt` |

### Allowed senders (`users.json`)

Each authorized sender is mapped by email to their Luzmo API credentials:

```json
{
  "alice@company.com": {
    "luzmoKey": "your-luzmo-api-key",
    "luzmoToken": "your-luzmo-api-token"
  }
}
```

Matching is case-insensitive. Org credentials mint embed tokens (when enabled) and call the Luzmo Export API for chart PNGs. They are never included in outgoing mail.

Mail from any other address is marked seen and not answered, so the mailbox does not reply to strangers.

## Usage

Send a message from an allowed address to the bot mailbox:

```
To: analyst-bot@company.com
Subject: Revenue
What are the top categories by revenue?
```

The bot will:

1. Check the sender against `users.json`
2. Call `POST /0.1.0/aiprompt` with `agent: analyst`
3. Reply on the same thread (`In-Reply-To` / `References`)
4. Embed a chart PNG inline when Luzmo returns a visualization

Reply in that thread to continue the same Luzmo `conversation_id` for one hour. Quoted history and signatures are removed before the question is sent.

The bot does not answer its own mail, and it skips messages with `Auto-Submitted` other than `no`, so out-of-office replies do not start a loop. Its own replies set `Auto-Submitted: auto-replied`.

Conversation ids are kept in memory for one hour. Restarting the process, or running more than one instance, starts a fresh Luzmo conversation. If the IMAP connection drops, the bot reconnects and picks up unseen mail.

## Architecture

```
IMAP → message-handler → aiprompt-client → Luzmo /AIPrompt
                       → chart-renderer → SMTP reply (inline PNG)
```

See [createAIPrompt.md](https://developer.luzmo.com/api/createAIPrompt.md) for the API reference.
