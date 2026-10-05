/** Content-ID used for the inline chart image. */
export const CHART_CID = 'chart@luzmo-analyst';

export function emailAddress(value: string): string {
  const match = value.match(/<([^<>@\s]+@[^<>\s]+)>/);
  return (match?.[1] ?? value).trim().toLowerCase();
}

export function normalizeReferences(references: string | string[] | undefined): string[] {
  if (!references) return [];
  const parts = Array.isArray(references) ? references : references.split(/\s+/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** First id in the thread, so follow-ups share one Luzmo conversation. */
export function threadRootId(
  references: string[],
  inReplyTo: string | undefined,
  messageId: string | undefined
): string {
  if (references.length > 0) return references[0];
  if (inReplyTo) return inReplyTo;
  return messageId ?? 'unknown-thread';
}

export function replyReferences(
  references: string[],
  inReplyTo: string | undefined,
  messageId: string | undefined
): string | undefined {
  const ids = [...references];
  if (inReplyTo && !ids.includes(inReplyTo)) ids.push(inReplyTo);
  if (messageId && !ids.includes(messageId)) ids.push(messageId);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function replySubject(subject: string | undefined): string {
  const trimmed = (subject ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return 'Re: Your question';
  if (/^re:/i.test(trimmed)) return trimmed;
  return `Re: ${trimmed}`;
}

function isReplyCutoff(line: string, alreadyHasContent: boolean): boolean {
  const trimmed = line.trim();
  if (/^on .+ wrote:\s*$/i.test(trimmed)) return true;
  if (/^-{2,}\s*original message\s*-{2,}$/i.test(trimmed)) return true;
  if (/^_{5,}$/.test(trimmed)) return true;
  if (alreadyHasContent && /^from:\s+\S+@\S+/i.test(trimmed)) return true;
  if (/^sent from my /i.test(trimmed)) return true;
  return false;
}

/**
 * Keeps the new text the sender wrote and drops quoted history and signatures.
 */
export function stripQuotedReply(body: string): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const kept: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '--' || trimmed === '-- ') break;
    if (isReplyCutoff(line, kept.some((entry) => entry.trim().length > 0))) break;
    if (trimmed.startsWith('>')) continue;
    kept.push(line);
  }

  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function extractEmailQuestion(body: string, subject: string): string {
  const fromBody = stripQuotedReply(body);
  if (fromBody) return fromBody;
  return subject.replace(/^(re|fw|fwd):\s*/i, '').trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Turns a short Markdown answer into HTML safe to embed in an email. */
export function markdownToEmailHtml(text: string): string {
  if (!text.trim()) return '';

  const placeholders: string[] = [];
  const stash = (match: string): string => {
    const index = placeholders.length;
    placeholders.push(match);
    return `\u0000CODE${index}\u0000`;
  };

  const escaped = escapeHtml(text)
    .replace(/```[\s\S]*?```/g, stash)
    .replace(/`[^`\n]+`/g, stash)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>')
    .replace(/\u0000CODE(\d+)\u0000/g, (_match, index) => placeholders[Number(index)] ?? '');

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

export function buildReplyContent(answer: string, hasChart: boolean): { text: string; html: string } {
  const text = [answer.trim(), hasChart ? '[Chart attached]' : ''].filter(Boolean).join('\n\n');
  const html = [
    markdownToEmailHtml(answer),
    hasChart
      ? `<p><img src="cid:${CHART_CID}" alt="Chart" style="max-width:100%;height:auto"></p>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    text: text || (hasChart ? '[Chart attached]' : 'No response generated.'),
    html: html || '<p>No response generated.</p>',
  };
}
