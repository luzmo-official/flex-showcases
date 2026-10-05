export interface MentionRef {
  id?: string;
  text?: string;
}

function principalTail(id: string): string {
  const colon = id.lastIndexOf(':');
  return colon >= 0 ? id.slice(colon + 1) : id;
}

export function samePrincipal(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const aTail = principalTail(a);
  const bTail = principalTail(b);
  return aTail.length > 0 && aTail === bTail;
}

/**
 * Personal chats are always addressed to the bot.
 * Thread replies are delivered because the bot was already mentioned.
 * New channel and group-chat messages must @mention the bot.
 */
export function isAddressedToBot(input: {
  conversationType?: string;
  conversationId?: string;
  recipientId?: string;
  mentions: MentionRef[];
}): boolean {
  if (input.conversationType === 'personal') return true;
  if (/(?:^|;)messageid=/.test(input.conversationId ?? '')) return true;
  if (!input.recipientId) return false;
  return input.mentions.some((mention) => samePrincipal(mention.id, input.recipientId));
}

/**
 * Removes the bot @mention from a Teams message.
 * Mention text is typically `<at>Bot Name</at>`.
 */
export function extractQuestionText(text: string | undefined, mentionTexts: string[]): string {
  let result = text ?? '';
  for (const mention of mentionTexts) {
    if (!mention) continue;
    result = result.split(mention).join('');
  }
  return result.replace(/<at>[\s\S]*?<\/at>/gi, '').replace(/\s+/g, ' ').trim();
}
