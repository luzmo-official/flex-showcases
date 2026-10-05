export interface ImapMailbox {
  searchUnseen(): Promise<number[]>;
  fetchSource(uid: number): Promise<Buffer | null>;
  markSeen(uid: number): Promise<void>;
}

/**
 * Reads each unseen message once. A failed message is retried once, then
 * marked seen so a poison message cannot loop on every new arrival.
 */
export async function processUnseen(
  mailbox: ImapMailbox,
  onMessage: (raw: Buffer) => Promise<unknown>
): Promise<void> {
  const uids = await mailbox.searchUnseen();

  for (const uid of uids) {
    const source = await mailbox.fetchSource(uid);
    if (!source) {
      await mailbox.markSeen(uid);
      continue;
    }

    try {
      await onMessage(source);
    } catch (error) {
      console.error(`Failed to handle IMAP message ${uid}, retrying once:`, error);
      try {
        await onMessage(source);
      } catch (retryError) {
        console.error(`Giving up on IMAP message ${uid}:`, retryError);
      }
    }

    await mailbox.markSeen(uid);
  }
}
