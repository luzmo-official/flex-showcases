import {
  ActivityTypes,
  CardFactory,
  CloudAdapter,
  MessageFactory,
  TurnContext,
  type ConversationReference,
} from 'botbuilder';
import { buildAnalystCard } from './analyst-card.js';
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
import { publishChart } from './chart-publish.js';
import { renderChartToPng } from './chart-renderer.js';
import { resolveEmbedCredentials } from './embed-auth.js';
import { resolveUserCredentials } from './permissions.js';
import { extractQuestionText, isAddressedToBot, samePrincipal } from './question.js';
import { TeamsUpdater } from './teams-updater.js';
import { conversationThreadKey, getConversationId, setConversationId } from './thread-history.js';
import type { AppConfig, ItemConfig, UserCredentials } from './types.js';

const inFlight = new Set<string>();
const seenActivities = new Map<string, number>();

function claimActivity(id: string | undefined): boolean {
  if (!id) return true;
  const now = Date.now();
  for (const [key, at] of seenActivities) {
    if (now - at > 10 * 60 * 1000) seenActivities.delete(key);
  }
  if (seenActivities.has(id)) return false;
  seenActivities.set(id, now);
  return true;
}

async function resolveAIPromptCredentials(
  config: AppConfig,
  credentials: UserCredentials
): Promise<{ luzmoKey: string; luzmoToken: string }> {
  if (!config.useEmbedAuth) {
    return {
      luzmoKey: credentials.luzmoKey,
      luzmoToken: credentials.luzmoToken,
    };
  }

  return resolveEmbedCredentials(
    credentials.luzmoKey,
    credentials.luzmoToken,
    config.luzmoHost,
    credentials.email,
    config.datasetIds
  );
}

async function sendWelcome(context: TurnContext): Promise<void> {
  if (context.activity.conversation?.conversationType !== 'personal') return;
  const botId = context.activity.recipient?.id;
  const added = context.activity.membersAdded ?? [];
  if (!added.some((member) => member.id === botId)) return;

  await context.sendActivity(
    'Hi — ask me a question about your data. For example: "What are the top categories by revenue?"'
  );
}

function failureText(reason: 'no-email' | 'unauthorized'): string {
  if (reason === 'no-email') {
    return (
      "I couldn't read your Microsoft 365 email address. An administrator needs to grant this bot " +
      'the Microsoft Graph application permission User.Read.All and consent to it.'
    );
  }
  return "Sorry, you don't have permission to use this bot. Contact an administrator to get access.";
}

interface AnalysisParams {
  adapter: CloudAdapter;
  reference: Partial<ConversationReference>;
  activityId: string;
  config: AppConfig;
  credentials: UserCredentials;
  question: string;
  thread: string;
}

async function runAnalysis(params: AnalysisParams): Promise<void> {
  const { adapter, reference, activityId, config, credentials, question, thread } = params;

  await adapter.continueConversationAsync(config.microsoftAppId, reference, async (context) => {
    const updater = new TeamsUpdater(context, activityId);

    try {
      const promptCreds = await resolveAIPromptCredentials(config, credentials);
      let fullText = '';
      let chartItem: ItemConfig | undefined;
      let finishText = '';

      const stream = streamAIPrompt({
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
          updater.updateProgress(message.progress);
        } else if (isTextDeltaMessage(message)) {
          fullText += message.textDelta;
          updater.appendText(message.textDelta);
        } else if (isFinishMessage(message)) {
          const convId = message.conversationId ?? message.result?.conversation_id;
          if (convId) setConversationId(thread, convId);

          finishText = extractTextFromResult(message.result);
          chartItem = extractItemFromResult(message.result);

          const finalText = finishText || fullText || (chartItem ? '' : 'No response generated.');
          await updater.finish(finalText);
        } else if (isErrorMessage(message)) {
          await updater.setError(message.error);
        }
      }

      if (!updater.isFinished) {
        await updater.finish(fullText || 'No response generated.');
      }

      const hasTextResponse = !!(fullText || finishText);
      if (chartItem) {
        try {
          await updater.setSuffix('Generating chart…');
          const png = await renderChartToPng(chartItem, {
            luzmoKey: credentials.luzmoKey,
            luzmoToken: credentials.luzmoToken,
            luzmoHost: config.luzmoHost,
          });
          await updater.setSuffix(null);

          if (!png) {
            console.warn('Chart rendering returned no image');
            return;
          }

          const published = await publishChart(context, png, config.publicBaseUrl);
          if (published.imageUrl) {
            await updater.setImageUrl(published.imageUrl);
          } else if (published.attachment) {
            await updater.setImageAttachment(published.attachment);
          } else if (!hasTextResponse) {
            await updater.finish(
              'I created a chart, but it could not be displayed. Set PUBLIC_BASE_URL to this bot’s public HTTPS origin.'
            );
          } else {
            await updater.setSuffix(
              'A chart was created, but it could not be displayed. Set PUBLIC_BASE_URL to this bot’s public HTTPS origin.'
            );
          }
        } catch (chartError) {
          console.error('Failed to render/upload chart:', chartError);
          await updater.setSuffix(null);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('AIPrompt stream error:', error);
      await updater.setError(errorMsg);
    }
  });
}

/**
 * Handles a Teams turn. Long analyst calls continue after this function
 * returns so the Bot Framework HTTP request is acknowledged immediately.
 */
export async function handleTurn(
  context: TurnContext,
  config: AppConfig,
  adapter: CloudAdapter
): Promise<void> {
  const activity = context.activity;
  if (activity.channelId !== 'msteams') return;

  if (activity.type === ActivityTypes.ConversationUpdate) {
    await sendWelcome(context);
    return;
  }

  if (activity.type !== ActivityTypes.Message) return;
  if (activity.from?.id && activity.from.id === activity.recipient?.id) return;

  const mentions = TurnContext.getMentions(activity);
  const addressed = isAddressedToBot({
    conversationType: activity.conversation?.conversationType,
    conversationId: activity.conversation?.id,
    recipientId: activity.recipient?.id,
    mentions: mentions.map((mention) => ({
      id: mention.mentioned?.id,
      text: mention.text,
    })),
  });
  if (!addressed) return;
  if (!claimActivity(activity.id)) return;

  const botMentions = mentions.filter((mention) =>
    samePrincipal(mention.mentioned?.id, activity.recipient?.id)
  );
  const question = extractQuestionText(
    activity.text,
    botMentions.map((mention) => mention.text ?? '')
  );
  if (!question) {
    await context.sendActivity('Please include a question after mentioning me.');
    return;
  }

  const userId = activity.from?.id;
  if (!userId) return;

  const resolution = await resolveUserCredentials(context, userId, config);
  if (!resolution.ok) {
    await context.sendActivity(failureText(resolution.reason));
    return;
  }

  const thread = conversationThreadKey(activity);
  if (inFlight.has(thread)) {
    await context.sendActivity('I am still answering the previous question in this conversation.');
    return;
  }

  await context.sendActivity({ type: ActivityTypes.Typing });

  const initial = MessageFactory.attachment(
    CardFactory.adaptiveCard(
      buildAnalystCard({
        progress: '',
        body: 'Analyzing your question…',
        suffix: null,
        imageUrl: null,
        isError: false,
      })
    )
  );
  const sent = await context.sendActivity(initial);
  if (!sent?.id) {
    console.error('Failed to post initial Teams message — no activity id returned');
    return;
  }

  const reference = TurnContext.getConversationReference(activity);
  inFlight.add(thread);

  void runAnalysis({
    adapter,
    reference,
    activityId: sent.id,
    config,
    credentials: resolution.credentials,
    question,
    thread,
  })
    .catch((error) => {
      console.error(
        'Failed to continue the Teams conversation. Check MicrosoftAppId, MicrosoftAppPassword, MicrosoftAppType, and MicrosoftAppTenantId.',
        error
      );
    })
    .finally(() => {
      inFlight.delete(thread);
    });
}
