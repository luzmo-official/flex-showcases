import { simpleParser } from 'mailparser';
import {
  extractItemFromResult,
  extractTextFromResult,
  isErrorMessage,
  isFinishMessage,
  isProgressMessage,
  isStartMessage,
  isTextDeltaMessage,
  streamAIPrompt,
} from './aiprompt-client.js';
import { renderChartToPng } from './chart-renderer.js';
import {
  buildReplyContent,
  CHART_CID,
  extractEmailQuestion,
  normalizeReferences,
  replyReferences,
  replySubject,
  threadRootId,
} from './email-text.js';
import { resolveEmbedCredentials } from './embed-auth.js';
import { getConversationId, setConversationId } from './thread-history.js';
import type {
  AIPromptRequestParams,
  AIPromptStreamMessage,
  AppConfig,
  ItemConfig,
  OutgoingReply,
  UserCredentials,
} from './types.js';
import { credentialsForEmail } from './users.js';

export type AnalystAsk = (
  params: AIPromptRequestParams
) => AsyncGenerator<AIPromptStreamMessage>;

export type ChartRenderer = typeof renderChartToPng;

export type MailSender = (reply: OutgoingReply) => Promise<void>;

export type HandleResult =
  | { action: 'replied' }
  | { action: 'skipped'; reason: 'no-from' | 'self' | 'unauthorized' | 'auto-reply' | 'duplicate' };

const handledMessageIds = new Set<string>();

function headerText(value: unknown): string {
  if (Array.isArray(value)) return value.map((entry) => String(entry)).join(' ');
  if (value == null) return '';
  return String(value);
}

function isOwnAddress(email: string, config: AppConfig): boolean {
  const own = new Set([config.imapUser, config.smtpFromAddress].map((entry) => entry.toLowerCase()));
  return own.has(email.toLowerCase());
}

async function resolveAIPromptCredentials(
  config: AppConfig,
  credentials: UserCredentials
): Promise<{ luzmoKey: string; luzmoToken: string }> {
  if (!config.useEmbedAuth) {
    return { luzmoKey: credentials.luzmoKey, luzmoToken: credentials.luzmoToken };
  }

  return resolveEmbedCredentials(
    credentials.luzmoKey,
    credentials.luzmoToken,
    config.luzmoHost,
    credentials.email,
    config.datasetIds
  );
}

async function runAnalyst(
  question: string,
  thread: string,
  config: AppConfig,
  credentials: UserCredentials,
  ask: AnalystAsk,
  renderChart: ChartRenderer
): Promise<{ text: string; png: Buffer | null }> {
  const promptCreds = await resolveAIPromptCredentials(config, credentials);
  let fullText = '';
  let finishText = '';
  let chartItem: ItemConfig | undefined;

  const stream = ask({
    question,
    luzmoKey: promptCreds.luzmoKey,
    luzmoToken: promptCreds.luzmoToken,
    luzmoHost: config.luzmoHost,
    datasetIds: config.datasetIds,
    conversationId: getConversationId(thread),
  });

  for await (const message of stream) {
    if (isStartMessage(message)) {
      setConversationId(thread, message.conversationId);
    } else if (isProgressMessage(message)) {
      if (message.conversationId) setConversationId(thread, message.conversationId);
    } else if (isTextDeltaMessage(message)) {
      fullText += message.textDelta;
    } else if (isFinishMessage(message)) {
      const convId = message.conversationId ?? message.result?.conversation_id;
      if (convId) setConversationId(thread, convId);
      finishText = extractTextFromResult(message.result);
      chartItem = extractItemFromResult(message.result);
    } else if (isErrorMessage(message)) {
      throw new Error(message.error);
    }
  }

  const text = finishText || fullText;
  if (!chartItem) {
    return { text: text || 'No response generated.', png: null };
  }

  const png = await renderChart(chartItem, {
    luzmoKey: credentials.luzmoKey,
    luzmoToken: credentials.luzmoToken,
    luzmoHost: config.luzmoHost,
  });

  if (!png) {
    console.warn('Chart rendering returned no image');
  }

  return { text, png };
}

export interface HandleIncomingEmailOptions {
  raw: Buffer;
  config: AppConfig;
  ask?: AnalystAsk;
  renderChart?: ChartRenderer;
  send: MailSender;
}

/**
 * Answers one inbound message when the sender is listed in users.json.
 * Mail from anyone else is ignored. Chart PNGs are attached inline.
 */
export async function handleIncomingEmail(options: HandleIncomingEmailOptions): Promise<HandleResult> {
  const { raw, config, send } = options;
  const ask = options.ask ?? streamAIPrompt;
  const renderChart = options.renderChart ?? renderChartToPng;
  const parsed = await simpleParser(raw);

  const messageId = parsed.messageId;
  if (messageId && handledMessageIds.has(messageId)) {
    return { action: 'skipped', reason: 'duplicate' };
  }

  const autoSubmitted = headerText(parsed.headers.get('auto-submitted')).trim().toLowerCase();
  if (autoSubmitted && autoSubmitted !== 'no') {
    if (messageId) handledMessageIds.add(messageId);
    return { action: 'skipped', reason: 'auto-reply' };
  }

  const from = parsed.from?.value?.[0]?.address?.trim().toLowerCase();
  if (!from) {
    return { action: 'skipped', reason: 'no-from' };
  }
  if (isOwnAddress(from, config)) {
    if (messageId) handledMessageIds.add(messageId);
    return { action: 'skipped', reason: 'self' };
  }

  const credentials = credentialsForEmail(config.users, from);
  if (!credentials) {
    console.warn(`Ignoring mail from unauthorized sender ${from}`);
    if (messageId) handledMessageIds.add(messageId);
    return { action: 'skipped', reason: 'unauthorized' };
  }

  const references = normalizeReferences(parsed.references);
  const inReplyTo = typeof parsed.inReplyTo === 'string' ? parsed.inReplyTo : undefined;
  const thread = threadRootId(references, inReplyTo, messageId);
  const question = extractEmailQuestion(parsed.text ?? '', parsed.subject ?? '');

  const envelope = {
    to: from,
    subject: replySubject(parsed.subject),
    inReplyTo: messageId,
    references: replyReferences(references, inReplyTo, messageId),
  };

  let reply: OutgoingReply;
  try {
    if (!question) {
      reply = {
        ...envelope,
        ...buildReplyContent('Please include a question in your email.', false),
        attachments: [],
      };
    } else {
      const answer = await runAnalyst(question, thread, config, credentials, ask, renderChart);
      reply = {
        ...envelope,
        ...buildReplyContent(answer.text, Boolean(answer.png)),
        attachments: answer.png
          ? [
              {
                filename: 'chart.png',
                content: answer.png,
                cid: CHART_CID,
                contentType: 'image/png',
                contentDisposition: 'inline',
              },
            ]
          : [],
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to answer email:', error);
    reply = {
      ...envelope,
      ...buildReplyContent(`Error: ${message}`.slice(0, 1500), false),
      attachments: [],
    };
  }

  await send(reply);
  if (messageId) handledMessageIds.add(messageId);
  return { action: 'replied' };
}
