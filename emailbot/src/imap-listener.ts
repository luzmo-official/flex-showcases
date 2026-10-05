import { ImapFlow } from 'imapflow';
import type { AppConfig } from './types.js';
import { processUnseen, type ImapMailbox } from './mailbox.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mailboxApi(client: ImapFlow): ImapMailbox {
  return {
    async searchUnseen() {
      const result = await client.search({ seen: false }, { uid: true });
      return Array.isArray(result) ? result : [];
    },
    async fetchSource(uid) {
      const message = await client.fetchOne(String(uid), { source: true }, { uid: true });
      if (!message || !message.source) return null;
      return Buffer.from(message.source);
    },
    async markSeen(uid) {
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
    },
  };
}

/**
 * Watches a mailbox over IMAP IDLE and passes each unseen message to onMessage.
 * ImapFlow cannot reconnect an instance, so a dropped connection opens a new one.
 */
export async function listenForMail(
  config: AppConfig,
  onMessage: (raw: Buffer) => Promise<unknown>
): Promise<void> {
  let stopped = false;
  let delayMs = 1000;
  let active: ImapFlow | undefined;

  const stop = () => {
    stopped = true;
    active?.close();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  while (!stopped) {
    const client = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: config.imapSecure,
      auth: {
        user: config.imapUser,
        pass: config.imapPassword,
      },
      logger: false,
      emitLogs: false,
    });

    let processing = false;
    let queued = false;

    const drain = async () => {
      if (processing) {
        queued = true;
        return;
      }
      processing = true;
      const lock = await client.getMailboxLock(config.imapMailbox);
      try {
        do {
          queued = false;
          await processUnseen(mailboxApi(client), onMessage);
        } while (queued && !stopped);
      } finally {
        processing = false;
        try {
          lock.release();
        } catch (error) {
          console.error('Failed to release mailbox lock:', error);
        }
      }
    };

    active = client;
    const closed = new Promise<void>((resolve) => {
      client.once('close', () => resolve());
    });

    try {
      await client.connect();
      delayMs = 1000;
      await client.mailboxOpen(config.imapMailbox);
      console.log(`Watching ${config.imapMailbox} on ${config.imapHost} for ${config.imapUser}`);

      client.on('exists', () => {
        drain().catch((error) => console.error('Failed to read new mail:', error));
      });
      client.on('error', (error) => console.error('IMAP error:', error));

      await drain();
      if (!stopped) await closed;
    } catch (error) {
      console.error('IMAP connection failed:', error);
    }

    try {
      await client.logout();
    } catch {
      client.close();
    }

    if (stopped) break;
    console.log(`Reconnecting to IMAP in ${delayMs}ms`);
    await sleep(delayMs);
    delayMs = Math.min(delayMs * 2, 60_000);
  }
}
