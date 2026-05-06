import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SlotConfig, VizItemOptions } from '@luzmo/dashboard-contents-types';
import { EMPTY, merge, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LuzmoChartConfig, LuzmoEmbedCredentials, LuzmoFlexChart, ProcessedDashboard, RowsData, Securable } from '../../types';
import { User } from '../auth/auth.service';
import { LanguageService } from '../language/language.service';
import { ThemeService } from '../theme/theme.service';

interface LuzmoIQStateStream {
  type: 'state';
  state: string;
}

interface LuzmoIQTextStream {
  type: 'chunk';
  text: string;
}

interface LuzmoIQChartStream {
  type: 'chart';
  chart: LuzmoFlexChart;
}

type AIStreamResponse = LuzmoIQStateStream | LuzmoIQTextStream | LuzmoIQChartStream;

@Injectable({
  providedIn: 'root'
})
export class LuzmoApiService implements OnDestroy {
  private readonly apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);
  private embedCredentialsSubject = new ReplaySubject<LuzmoEmbedCredentials>(1);
  private embedTokenInitialized = false;
  private currentUser: User | undefined;

  // Cache for AI Summary Stream
  private activeAISummaryStream$: Observable<AIStreamResponse> | null = null;
  private activeAISummaryIdentifier: string | null = null;
  private activeAISummaryAbortController: AbortController | null = null;
  private activeAIQuestionAbortController: AbortController | null = null;

  // Global mode for the app, switches between modular report builder and full EDE for demo purposes.
  private _globalDashboardEditMode: 'modular-report-builder' | 'full-ede' = 'modular-report-builder';

  get globalDashboardEditMode(): 'modular-report-builder' | 'full-ede' {
    return this._globalDashboardEditMode;
  }

  setGlobalDashboardEditMode(mode: 'modular-report-builder' | 'full-ede'): void {
    this._globalDashboardEditMode = mode;
  }

  constructor() {
    // Refresh token with correct theme, language and currency when they change.
    merge(this.themeService.themeChanged$, this.languageService.currentLanguage$)
      .pipe(
        filter(() => this.embedTokenInitialized && !!this.currentUser),
        switchMap(() =>
          this.refreshLuzmoCredentials().pipe(
            catchError((error) => {
              console.error('Error refreshing Luzmo credentials:', error);

              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  getLuzmoFlexOptions(itemsBackground?: string): Pick<VizItemOptions, 'theme' | 'locale' | 'loader'> {
    const theme = this.themeService.getLuzmoDashboardTheme();

    if (itemsBackground) {
      theme.itemsBackground = itemsBackground;
    }

    return {
      theme,
      locale: this.languageService.getCurrentLanguage(),
      loader: {
        locale: this.languageService.getCurrentLanguage(),
        spinnerColor: getComputedStyle(document.body).getPropertyValue('--color-primary').trim(),
        fontColor: getComputedStyle(document.body).getPropertyValue('--color-text').trim(),
        background: 'transparent'
      }
    };
  }

  requestLuzmoCredentials(user: User): Observable<LuzmoEmbedCredentials> {
    // Store the current user for potential refresh
    this.currentUser = user;

    return this.fetchLuzmoCredentials(user);
  }

  refreshLuzmoCredentials(): Observable<LuzmoEmbedCredentials> {
    // Force refresh by resetting initialization flag and fetching new credentials
    this.embedTokenInitialized = false;

    return this.fetchLuzmoCredentials(this.currentUser);
  }

  private fetchLuzmoCredentials(user: User | undefined): Observable<LuzmoEmbedCredentials> {
    if (!user) {
      return new Observable((observer) => {
        observer.error('No user provided');
      });
    }

    // Create an observable from the HTTP request
    const credentialsObservable = this.httpClient
      .post<{ id: string; token: string }>(`${this.apiUrl}/embed`, {
        theme: this.themeService.getLuzmoDashboardTheme(),
        locale_id: this.languageService.getCurrentLanguage(),
        user
      })
      .pipe(
        map((response) => ({ key: response.id, token: response.token })),
        tap({
          next: (credentials) => {
            this.embedCredentialsSubject.next(credentials);
            this.embedTokenInitialized = true;
          },
          error: (error) => {
            console.error('Error fetching Luzmo credentials:', error);
          }
        }),
        take(1),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return credentialsObservable;
  }

  getLuzmoCredentials(): Observable<LuzmoEmbedCredentials> {
    return this.embedCredentialsSubject.asObservable();
  }

  clearLuzmoCredentials(): void {
    this.embedCredentialsSubject.next({ key: '', token: '' });
    this.embedTokenInitialized = false;
    this.currentUser = undefined;

    // Clear AI summary cache as credentials are no longer valid
    this.activeAISummaryAbortController?.abort();
    this.activeAISummaryAbortController = null;
    this.activeAISummaryStream$ = null;
    this.activeAISummaryIdentifier = null;
  }

  querySubregions(user: User | null): Observable<{ data: { id: string; name: Record<string, string> }[][] }> {
    if (!user) {
      return of({ data: [] });
    }

    return this.httpClient.post<{ data: { id: string; name: Record<string, string> }[][] }>(`${this.apiUrl}/query-subregions`, { user });
  }

  loadDashboards(dashboardIds: string[]): Observable<ProcessedDashboard[]> {
    return this.httpClient
      .post<RowsData<Pick<Securable, 'id' | 'name' | 'contents'>>>(`${this.apiUrl}/dashboards`, {
        dashboardIds
      })
      .pipe(
        map((response) => response.rows),
        map((dashboards) =>
          dashboards.map((dashboard) => ({
            id: dashboard.id,
            name: dashboard.name,
            items:
              dashboard.contents.views[0]?.items.map((item) => ({
                id: item.id,
                type: item.type,
                slots: item.slots,
                options: item.options
              })) || []
          }))
        )
      );
  }

  loadCustomChart(type: string): Observable<LuzmoChartConfig> {
    return this.httpClient
      .post<RowsData<{ type: string; slots_config: SlotConfig[] }>>(`${this.apiUrl}/customchart`, {
        type
      })
      .pipe(
        map((response) => response.rows[0]),
        map(
          (response) =>
            ({
              type: response.type,
              slotsConfig: response.slots_config.map((slot: any) => ({
                ...slot,
                rotate: false
              })),
              slotContents: response.slots_config.map((slot: any) => ({
                name: slot.name,
                content: []
              })),
              defaultOptions: {}
            }) as LuzmoChartConfig
        )
      );
  }

  createAIChart(datasetId: string, description: string): Observable<AIStreamResponse> {
    return this.httpClient
      .post<{ generatedChart: LuzmoFlexChart }>(`${this.apiUrl}/aichart`, {
        datasetId,
        description
      })
      .pipe(
        map((response) => response.generatedChart),
        map((chart) => ({
          type: 'chart',
          chart: {
            type: chart.type,
            slots: chart.slots,
            options: chart.options
          }
        }))
      );
  }

  getAIChartSuggestions(datasetId: string): Observable<{ title: string }[]> {
    return this.httpClient
      .post<{ examples: { title: string }[] }>(`${this.apiUrl}/aichart-suggestions`, { datasetId })
      .pipe(map((response) => response.examples));
  }

  getStreamedIQAnswer(question: string, key: string, token: string): Observable<AIStreamResponse> {
    const trimmedQuestion = question?.trim();

    if (!trimmedQuestion) {
      return throwError(() => new Error('Question cannot be empty.'));
    }

    const currentLanguage = this.languageService.getCurrentLanguage();
    const streamSourceSubject = new ReplaySubject<AIStreamResponse>();

    this.activeAIQuestionAbortController?.abort();

    const abortController = new AbortController();

    this.activeAIQuestionAbortController = abortController;

    const handleLine = (line: string): boolean => this.handleStreamLine(line, streamSourceSubject, 'IQ Answer');

    void (async () => {
      try {
        const response = await fetch(`${environment.luzmoApiUrl}/0.1.0/iqmessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'create',
            version: '0.1.0',
            key,
            token,
            properties: {
              order: 1,
              prompt: trimmedQuestion,
              response_mode: 'text_only',
              locale_id: currentLanguage
            }
          }),
          signal: abortController.signal
        });

        if (!response.ok) {
          try {
            const errorText = await response.text();
            const errorMessage = `IQ Answer API request failed with status ${response.status}: ${errorText}`;

            console.error(errorMessage);
            streamSourceSubject.error(new Error(errorMessage));
          } catch {
            const errorMessage = `IQ Answer API request failed with status ${response.status} and could not read error body.`;

            console.error(errorMessage);
            streamSourceSubject.error(new Error(errorMessage));
          } finally {
            streamSourceSubject.complete();
          }

          return;
        }

        if (!response.body) {
          const errorMessage = 'IQ Answer API response has no body to read.';

          console.error(errorMessage);
          streamSourceSubject.error(new Error(errorMessage));
          streamSourceSubject.complete();

          return;
        }

        const reader = response.body.getReader();

        await this.processAIStream(reader, streamSourceSubject, handleLine);
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') {
          streamSourceSubject.complete();

          return;
        }

        console.error('Error processing IQ Answer stream:', error);
        streamSourceSubject.error(error);
        streamSourceSubject.complete();
      } finally {
        if (this.activeAIQuestionAbortController === abortController) {
          this.activeAIQuestionAbortController = null;
        }
      }
    })();

    return streamSourceSubject.asObservable();
  }

  cancelActiveIQAnswer(): void {
    this.activeAIQuestionAbortController?.abort();
    this.activeAIQuestionAbortController = null;
  }

  getStreamedAISummary(key: string, token: string): Observable<AIStreamResponse> {
    const currentLanguage = this.languageService.getCurrentLanguage();
    const identifier = `user=${this.currentUser?.name}_lang=${currentLanguage}`;

    if (this.activeAISummaryIdentifier === identifier && this.activeAISummaryStream$) {
      return this.activeAISummaryStream$;
    }

    this.activeAISummaryAbortController?.abort();

    const streamSourceSubject = new ReplaySubject<AIStreamResponse>();

    this.activeAISummaryStream$ = streamSourceSubject.asObservable();
    this.activeAISummaryIdentifier = identifier;

    const abortController = new AbortController();

    this.activeAISummaryAbortController = abortController;

    const clearCachedStream = () => {
      if (this.activeAISummaryIdentifier === identifier) {
        this.activeAISummaryStream$ = null;
        this.activeAISummaryIdentifier = null;
      }

      if (this.activeAISummaryAbortController === abortController) {
        this.activeAISummaryAbortController = null;
      }
    };

    const handleLine = (line: string): boolean => this.handleStreamLine(line, streamSourceSubject, 'AI Summary');

    // Use fetch directly for streaming support
    void (async () => {
      try {
        const response = await fetch(`${environment.luzmoApiUrl}/0.1.0/iqmessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'create',
            version: '0.1.0',
            key,
            token,
            properties: {
              order: 1,
              prompt: `
                You are a senior sales-analytics consultant.

                **Objective**  
                1. Analyse individual **sales rep productivity** and surface coaching insights for the current user, a Sales Director.

                **Data preparation steps**  
                1. Apply a **Closed-won filter** - only keep rows where 'Deal stage' equals 'Closed Won'.

                **Metrics to surface per Sales rep**
                - **'Deal velocity'**. Use a currency symbol in the output (use "$" if ${currentLanguage} is "en", "€" otherwise). Round the value to a whole number.
                - **Mean 'Days in pipeline'** (lower is better). Round the value to a whole number.
                - **Total closed-won 'Amount'**. Use a currency symbol in the output (use "$" if ${currentLanguage} is "en", "€" otherwise).Format this with magnitude suffixes with 3 digits precision (e.g. "$1.34M"). Ensure correct locale formatting.

                **Other rules:**
                - Add a short introduction at the beginning of the output: "Here is a quick overview of your team's performance:"). Put this in a <p> HTML tag. Make sure this sentence is localized for the current language: ${currentLanguage}!
                - Group the information per sales rep in bullet points, where each sales rep is one bullet point. Vary the sentence and grammar per bullet point. Put this in <ul> and <li> HTML elements.
                - Below the bullet points, write a conclusion based on the available data. Put this in a <p> HTML tag.
                - Keep the tone business-critical and actionable.
                - Around rep names, use a span HTML tag with the 'rep-name' HTML class.
                - Around metric names, use a span HTML tag with the 'metric-name' HTML class.
                - Do not ask for confirmation or clarification.
                - Use the correct currency symbol where appropriate.
              `,
              response_mode: 'text_only',
              locale_id: currentLanguage
            }
          }),
          signal: abortController.signal
        });

        if (!response.ok) {
          try {
            const errorText = await response.text();
            const errorMessage = `AI Summary API request failed with status ${response.status}: ${errorText}`;

            console.error(errorMessage);
            streamSourceSubject.error(new Error(errorMessage));
          } catch {
            const errorMessage = `AI Summary API request failed with status ${response.status} and could not read error body.`;

            console.error(errorMessage);
            streamSourceSubject.error(new Error(errorMessage));
          } finally {
            clearCachedStream();
          }

          return;
        }

        if (!response.body) {
          const errorMessage = 'AI Summary API response has no body to read.';

          console.error(errorMessage);
          streamSourceSubject.error(new Error(errorMessage));
          clearCachedStream();

          return;
        }

        const reader = response.body.getReader();

        await this.processAIStream(reader, streamSourceSubject, handleLine);
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') {
          return;
        }

        console.error('Error processing AI Summary stream:', error);
        streamSourceSubject.error(error);
        clearCachedStream();
      } finally {
        if (this.activeAISummaryAbortController === abortController) {
          this.activeAISummaryAbortController = null;
        }
      }
    })();

    return this.activeAISummaryStream$;
  }

  /**
   * Handles a parsed stream line from the AI API response.
   * Emits appropriate events (state, chunk, chart) to the provided subject.
   * Returns true if the stream should stop (done signal received).
   */
  private handleParsedStreamLine(parsed: any, subject: ReplaySubject<AIStreamResponse>): boolean {
    if (typeof parsed?.state === 'string') {
      subject.next({ type: 'state', state: parsed.state });
    }

    const textChunk = typeof parsed?.text === 'string' ? parsed.text : typeof parsed?.chunk === 'string' ? parsed.chunk : null;

    if (textChunk) {
      subject.next({ type: 'chunk', text: textChunk });
    }

    if (parsed?.chart) {
      subject.next({ type: 'chart', chart: parsed.chart as LuzmoFlexChart });
    }

    return parsed?.done === true;
  }

  /**
   * Handles a raw stream line from the AI API response.
   * Parses the JSON and delegates to handleParsedStreamLine.
   * Returns true if the stream should stop.
   */
  private handleStreamLine(line: string, subject: ReplaySubject<AIStreamResponse>, contextName: string): boolean {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return false;
    }

    try {
      const parsed = JSON.parse(trimmedLine);

      return this.handleParsedStreamLine(parsed, subject);
    } catch (error) {
      console.error(`Error parsing ${contextName} stream line:`, error, 'Line:', line);

      return false;
    }
  }

  /**
   * Processes the AI stream from a ReadableStreamDefaultReader.
   * Handles line buffering and delegates line processing to the provided handleLine callback.
   */
  private processAIStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    subject: ReplaySubject<AIStreamResponse>,
    handleLine: (line: string) => boolean
  ): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';
    let streamCompleted = false;

    const completeStream = () => {
      if (!streamCompleted) {
        streamCompleted = true;
        subject.complete();
      }
    };

    const processStream = (): Promise<void> =>
      reader.read().then(({ done, value }) => {
        if (done) {
          if (buffer) {
            handleLine(buffer);
          }

          completeStream();

          return;
        }

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf('\n');

        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex);

          buffer = buffer.slice(newlineIndex + 1);

          const shouldStop = handleLine(line);

          if (shouldStop) {
            completeStream();
            reader.cancel().catch(() => {});

            return;
          }

          newlineIndex = buffer.indexOf('\n');
        }

        return processStream();
      });

    return processStream();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {
    // Empty implementation needed for the interface
  }
}
