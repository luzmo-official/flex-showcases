import { Component, input, output, OnDestroy, signal, ElementRef, viewChild, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { switchItem } from '@luzmo/analytics-components-kit/utils';
import type { VizItemType } from '@luzmo/dashboard-contents-types';
import { LuzmoFlexChart } from '../luzmo-constants';
import { LUZMO_CONTROL_CENTRE_THEME, LUZMO_CONTROL_CENTRE_LOADER_OPTIONS } from '../luzmo-theme.config';

import '@luzmo/analytics-components-kit/item-data-picker-panel';

export interface ChatMessage {
  type: 'user' | 'system';
  text: string;
  time: string;
}

interface IQProgressEvent {
  id: string;
  step: string;
  status: 'pending' | 'inProgress' | 'success' | 'error';
  description?: string;
  descriptionMetadata?: Record<string, unknown>;
  children?: IQProgressEvent[];
}

interface IQStreamChunk {
  state?: string;
  messageId?: string;
  chunk?: string;
  done?: boolean;
  progress?: IQProgressEvent;
  chart?: LuzmoFlexChart;
}

const IQ_STATE_MESSAGES: Record<string, string> = {
  'relevantdatasets': 'SCANNING RELEVANT DATASETS...',
  'query': 'EXECUTING DATA QUERY...',
  'analysis': 'RUNNING ANALYSIS PROTOCOL...',
  'chart': 'VISUALIZING...'
};

type SupportedChartType = 'bar-chart' | 'line-chart' | 'column-chart' | 'donut-chart' | 'treemap-chart' | 'bubble-chart';

@Component({
  selector: 'app-terminal-chat',
  imports: [FormsModule, NgxLuzmoVizItemComponent],
  templateUrl: './terminal-chat.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TerminalChatComponent implements OnDestroy {
  // Inputs
  readonly credentials = input.required<{ key: string; token: string }>();
  readonly apiUrl = input.required<string>();
  readonly appServer = input.required<string>();

  // Outputs
  readonly chartGenerated = output<LuzmoFlexChart>();

  // Private state
  private activeAbortController: AbortController | null = null;
  private streamingMessageIndex: number | null = null;

  // Chat state
  protected readonly chatMessages = signal<ChatMessage[]>([
    { type: 'system', text: 'CONTROL_CENTRE v1.0.0 initialized.', time: this.formatTimeShort() },
    { type: 'system', text: 'AI_CORE ONLINE. Enter query to proceed.', time: this.formatTimeShort() },
  ]);
  protected readonly userInput = signal('');
  protected readonly isTyping = signal(false);
  protected readonly hasUserSentMessage = signal(false);

  protected readonly suggestedCommands = [
    'who is closing the most PRs?',
    'show bug trend by squad',
    'which squad has the most open bugs?',
  ];
  protected readonly chatMessagesContainer = viewChild<ElementRef<HTMLDivElement>>('chatMessagesContainer');
  protected readonly currentChart = signal<LuzmoFlexChart | null>(null);
  protected readonly dataPickerCollapsed = signal(false);
  protected readonly chartTypeOptions: ReadonlyArray<{ type: SupportedChartType; label: string }> = [
    { type: 'bar-chart', label: 'Bar' },
    { type: 'line-chart', label: 'Line' },
    { type: 'column-chart', label: 'Column' },
    { type: 'donut-chart', label: 'Donut' },
    { type: 'treemap-chart', label: 'Treemap' },
    { type: 'bubble-chart', label: 'Bubble' },
  ];

  // Unique datasets referenced in the currently generated chart (for data picker panel)
  protected readonly datasetIds = computed<string[]>(() => {
    const chart = this.themedChart();
    if (!chart) return [];

    const ids = new Set<string>();
    for (const slot of chart.slots ?? []) {
      for (const c of (slot as any)?.content ?? []) {
        const id = (c as any)?.set ?? (c as any)?.datasetId;
        if (typeof id === 'string' && id.length > 0) ids.add(id);
      }
    }
    return Array.from(ids);
  });

  // Computed chart with theme applied
  protected readonly themedChart = computed(() => {
    const chart = this.currentChart();
    if (!chart) return null;
    
    return {
      ...chart,
      options: {
        ...chart.options,
        availableExportTypes: [],
        exportTypes: [],
        display: { title: false },
        theme: { ...LUZMO_CONTROL_CENTRE_THEME },
        loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
        interactivity: {
          ...((chart.options as Record<string, unknown>)?.['interactivity'] as Record<string, unknown> ?? {}),
          availableExportTypes: null,
          exportTypes: null,
        },
      }
    };
  });

  /**
   * Send a chat message and get a response from the IQ API
   */
  sendMessage(prefill?: string): void {
    const input = (prefill ?? this.userInput()).trim();
    if (!input) return;

    const creds = this.credentials();
    if (!creds.key || !creds.token) {
      this.addSystemMessage('Error: Not authenticated. Please wait for initialization.');
      return;
    }

    this.hasUserSentMessage.set(true);
    const currentTime = this.formatTimeShort();
    
    // Add user message
    this.chatMessages.update(messages => [
      ...messages,
      { type: 'user', text: input, time: currentTime }
    ]);
    
    // Clear input
    this.userInput.set('');
    
    // Scroll to bottom
    this.scrollChatToBottom();
    
    // Show typing indicator and start streaming
    this.isTyping.set(true);
    
    // Call the IQ API with streaming
    void this.streamIQMessage(input);
  }

  dismissChart(): void {
    this.currentChart.set(null);
  }

  toggleDataPicker(): void {
    this.dataPickerCollapsed.update(v => !v);
  }

  /**
   * Handle keydown events in chat input
   */
  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async onChartTypeSelected(type: SupportedChartType): Promise<void> {
    const chart = this.currentChart();
    if (!chart || chart.type === type) return;

    try {
      const switched = await switchItem({
        oldItemType: chart.type,
        newItemType: type,
        slots: chart.slots,
        options: chart.options as Record<string, unknown>,
      });

      this.currentChart.update((current) => {
        if (!current) return current;
        return {
          ...current,
          type: switched.type as VizItemType,
          slots: switched.slots,
          options: {
            ...current.options,
            ...(switched.options ?? {}),
          },
        };
      });
    } catch (error) {
      console.error('Failed to switch chart type:', error);
      this.addSystemMessage('Failed to switch chart type. Please try another chart type.');
    }
  }

  onSlotsContentsChanged(event: Event): void {
    const slotsContents = (event as CustomEvent<{ slotsContents?: unknown }>).detail?.slotsContents;
    if (!Array.isArray(slotsContents)) return;

    this.currentChart.update((chart) => {
      if (!chart) return chart;
      return {
        ...chart,
        slots: slotsContents,
      };
    });
  }

  ngOnDestroy(): void {
    // Abort any active IQ request
    this.activeAbortController?.abort();
    this.activeAbortController = null;
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      const container = this.chatMessagesContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }

  private formatTimeShort(): string {
    return new Date().toTimeString().slice(0, 8);
  }

  /**
   * Stream an IQ message from the Luzmo API
   */
  private async streamIQMessage(prompt: string): Promise<void> {
    const creds = this.credentials();
    
    // Cancel any active request
    this.activeAbortController?.abort();
    
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const response = await fetch(`${this.apiUrl()}/0.1.0/iqmessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          version: '0.1.0',
          key: creds.key,
          token: creds.token,
          properties: {
            order: 1,
            prompt: prompt,
            response_mode: 'mixed',
            locale_id: 'en'
          }
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('API response has no body to read.');
      }

      const reader = response.body.getReader();
      await this.processStream(reader);

    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        // Request was aborted, don't show error
        return;
      }

      console.error('Error processing IQ stream:', error);
      this.addSystemMessage(`Error: ${(error as Error).message || 'Failed to get response'}`);
    } finally {
      this.isTyping.set(false);
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }
      this.streamingMessageIndex = null;
    }
  }

  /**
   * Process the streaming response from the API
   */
  private async processStream(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';

    const processChunk = async (): Promise<void> => {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          this.handleStreamLine(buffer);
        }
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      let newlineIndex = buffer.indexOf('\n');
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        const shouldStop = this.handleStreamLine(line);
        if (shouldStop) {
          reader.cancel().catch(() => {});
          return;
        }

        newlineIndex = buffer.indexOf('\n');

        console.log(line);
      }

      return processChunk();
    };

    await processChunk();
  }

  /**
   * Handle a single line from the stream
   * Returns true if the stream should stop
   */
  private handleStreamLine(line: string): boolean {
    const trimmedLine = line.trim();
    if (!trimmedLine) return false;

    try {
      const parsed: IQStreamChunk = JSON.parse(trimmedLine);
      return this.processStreamChunk(parsed);
    } catch (error) {
      console.error('Error parsing stream line:', error, 'Line:', line);
      return false;
    }
  }

  /**
   * Process a parsed stream chunk
   * Returns true if the stream should stop (done signal received)
   */
  private processStreamChunk(chunk: IQStreamChunk): boolean {
    // Handle state updates
    if (chunk.state) {
      const stateKey = chunk.state.toLowerCase();
      const message = IQ_STATE_MESSAGES[stateKey] ?? `[${chunk.state.toUpperCase()}]`;
      this.addSystemMessage(message);
      this.scrollChatToBottom();
    }

    // Handle text chunks - append to current streaming message
    if (chunk.chunk) {
      this.isTyping.set(false); // Stop typing indicator once we start receiving text
      
      if (this.streamingMessageIndex === null) {
        // Create a new message for the response
        const time = this.formatTimeShort();
        this.chatMessages.update(messages => [
          ...messages,
          { type: 'system', text: chunk.chunk!, time }
        ]);
        this.streamingMessageIndex = this.chatMessages().length - 1;
      } else {
        // Append to existing message
        this.chatMessages.update(messages => {
          const updated = [...messages];
          if (this.streamingMessageIndex !== null && updated[this.streamingMessageIndex]) {
            updated[this.streamingMessageIndex] = {
              ...updated[this.streamingMessageIndex],
              text: updated[this.streamingMessageIndex].text + chunk.chunk
            };
          }
          return updated;
        });
      }
      this.scrollChatToBottom();
    }

    // Handle chart response - store locally and emit to parent
    if (chunk.chart) {
      this.currentChart.set(chunk.chart);
      this.chartGenerated.emit(chunk.chart);
      console.log('Generated chart:', chunk.chart);
      this.scrollChatToBottom();
    }

    return chunk.done === true;
  }

  /**
   * Add a system message to the chat
   */
  private addSystemMessage(text: string): void {
    const time = this.formatTimeShort();
    this.chatMessages.update(messages => [
      ...messages,
      { type: 'system', text, time }
    ]);
  }
}
