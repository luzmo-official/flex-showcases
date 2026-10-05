import { CardFactory, MessageFactory, type Attachment, type TurnContext } from 'botbuilder';
import { buildAnalystCard } from './analyst-card.js';
import { markdownToTeams } from './markdown-to-teams.js';
import { formatProgressTree } from './progress-format.js';
import type { ProgressTreeNode } from './types.js';

const UPDATE_INTERVAL_MS = 1500;

export interface ChartImageAttachment {
  contentType: string;
  contentUrl: string;
  name: string;
}

/**
 * Updates one Teams message with progress and streaming text.
 * Throttles edits so Teams is not hit on every token.
 */
export class TeamsUpdater {
  private progressText = '';
  private bodyText = '';
  private suffix: string | null = null;
  private imageUrl: string | null = null;
  private imageAttachment: ChartImageAttachment | null = null;
  private isError = false;
  private dirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFlushTime = 0;
  private finished = false;

  get isFinished(): boolean {
    return this.finished;
  }

  constructor(
    private readonly context: TurnContext,
    private readonly activityId: string
  ) {}

  updateProgress(tree: ProgressTreeNode): void {
    const formatted = formatProgressTree(tree);
    if (formatted && formatted !== this.progressText) {
      this.progressText = formatted;
      this.scheduleFlush();
    }
  }

  appendText(token: string): void {
    this.bodyText += token;
    this.scheduleFlush();
  }

  /**
   * Flush the final answer immediately.
   * Clears progress steps so only the text body is shown.
   */
  async finish(finalText?: string): Promise<void> {
    this.finished = true;
    this.clearTimer();
    this.progressText = '';
    if (finalText !== undefined) this.bodyText = finalText;
    await this.flushNow(true);
  }

  /** Transient status under the answer, such as "Generating chart…". */
  async setSuffix(suffix: string | null): Promise<void> {
    this.suffix = suffix;
    await this.flushNow(true);
  }

  async setImageUrl(url: string): Promise<void> {
    this.imageUrl = url;
    this.imageAttachment = null;
    await this.flushNow(true);
  }

  async setImageAttachment(attachment: ChartImageAttachment): Promise<void> {
    this.imageAttachment = attachment;
    await this.flushNow(true);
  }

  async setError(message: string): Promise<void> {
    this.finished = true;
    this.clearTimer();
    this.progressText = '';
    this.suffix = null;
    this.imageUrl = null;
    this.imageAttachment = null;
    this.isError = true;
    this.bodyText = `Error: ${message}`.slice(0, 1500);
    await this.flushNow(true);
  }

  private clearTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private scheduleFlush(): void {
    if (this.finished) return;
    this.dirty = true;
    if (this.flushTimer) return;

    const elapsed = Date.now() - this.lastFlushTime;
    const delay = Math.max(0, UPDATE_INTERVAL_MS - elapsed);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushNow(false).catch((err) =>
        console.error('Failed to flush Teams message update:', err)
      );
    }, delay);
  }

  private buildActivity(includeId: boolean) {
    const card = buildAnalystCard({
      progress: this.finished ? '' : this.progressText,
      body: markdownToTeams(this.bodyText),
      suffix: this.suffix,
      imageUrl: this.imageUrl,
      isError: this.isError,
    });

    const activity = MessageFactory.attachment(CardFactory.adaptiveCard(card));
    if (includeId) activity.id = this.activityId;

    if (this.imageAttachment) {
      const image: Attachment = {
        contentType: this.imageAttachment.contentType,
        contentUrl: this.imageAttachment.contentUrl,
        name: this.imageAttachment.name,
      };
      activity.attachments = [...(activity.attachments ?? []), image];
    }

    return activity;
  }

  private async flushNow(force: boolean): Promise<void> {
    if (!force && !this.dirty && !this.finished) return;
    this.dirty = false;
    this.lastFlushTime = Date.now();

    try {
      await this.context.updateActivity(this.buildActivity(true));
    } catch (error) {
      console.error('Failed to update Teams message:', error);
      if (this.finished) {
        await this.context.sendActivity(this.buildActivity(false)).catch((sendError) => {
          console.error('Failed to send fallback Teams message:', sendError);
        });
      }
    }
  }
}
