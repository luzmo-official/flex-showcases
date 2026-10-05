import type { TurnContext } from 'botbuilder';
import { chartPublicUrl, storeChart } from './chart-store.js';
import type { ChartImageAttachment } from './teams-updater.js';

interface ConversationsApi {
  uploadAttachment(
    conversationId: string,
    attachmentUpload: { name?: string; type?: string; originalBase64?: Uint8Array }
  ): Promise<{ id?: string } | undefined>;
}

interface ConnectorLike {
  conversations: ConversationsApi;
}

/**
 * Publishes a chart PNG where the Teams client can load it.
 * Prefers PUBLIC_BASE_URL. Falls back to a Bot Connector attachment.
 */
export async function publishChart(
  context: TurnContext,
  png: Buffer,
  publicBaseUrl: string | undefined
): Promise<{ imageUrl?: string; attachment?: ChartImageAttachment }> {
  if (publicBaseUrl) {
    const id = storeChart(png);
    return { imageUrl: chartPublicUrl(publicBaseUrl, id) };
  }

  const connector = context.turnState.get(context.adapter.ConnectorClientKey) as ConnectorLike | undefined;
  const conversationId = context.activity.conversation?.id;
  const serviceUrl = context.activity.serviceUrl;
  if (!connector || !conversationId || !serviceUrl) return {};

  try {
    const uploaded = await connector.conversations.uploadAttachment(conversationId, {
      name: 'chart.png',
      type: 'image/png',
      originalBase64: png,
    });
    if (!uploaded?.id) return {};

    const base = serviceUrl.endsWith('/') ? serviceUrl : `${serviceUrl}/`;
    return {
      attachment: {
        contentType: 'image/png',
        contentUrl: `${base}v3/attachments/${uploaded.id}/views/original`,
        name: 'chart.png',
      },
    };
  } catch (error) {
    console.error('Failed to upload chart attachment:', error);
    return {};
  }
}
