interface ThreadEntry {
  conversationId: string;
  lastAccess: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour

const store = new Map<string, ThreadEntry>();

function evictStale(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.lastAccess > TTL_MS) {
      store.delete(key);
    }
  }
}

export interface ConversationActivity {
  id?: string;
  conversation?: { id?: string; conversationType?: string };
}

/**
 * Stable key for a Teams conversation thread.
 *
 * Personal chats keep one Luzmo conversation for the whole chat.
 * Channel and group-chat threads key off the root message id, which Teams
 * puts in `conversation.id` as `;messageid=` on replies.
 */
export function conversationThreadKey(activity: ConversationActivity): string {
  const conversationId = activity.conversation?.id ?? 'unknown';
  const conversationType = activity.conversation?.conversationType;

  if (conversationType === 'personal') {
    return `personal:${conversationId}`;
  }

  const messageId = /(?:^|;)messageid=([^;]+)/.exec(conversationId)?.[1];
  if (messageId) {
    const channelId = conversationId.split(';')[0];
    return `${channelId}:${messageId}`;
  }

  return `${conversationId}:${activity.id ?? 'root'}`;
}

/**
 * Returns the Luzmo AIConversation id for a Teams thread, if any.
 */
export function getConversationId(key: string): string | undefined {
  evictStale();
  const entry = store.get(key);
  if (!entry) return undefined;
  entry.lastAccess = Date.now();
  return entry.conversationId;
}

/**
 * Persists the Luzmo conversation id for follow-ups in the same Teams thread.
 */
export function setConversationId(key: string, conversationId: string): void {
  store.set(key, {
    conversationId,
    lastAccess: Date.now(),
  });
}
