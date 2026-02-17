import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../auth/auth.service';
import { LanguageService, Language } from '../language/language.service';
import { ThemeService } from '../theme/theme.service';
import { LuzmoApiService } from './luzmo-api.service';

const collectStream = (stream$: ReturnType<LuzmoApiService['getStreamedIQAnswer']>) =>
  new Promise<any[]>((resolve, reject) => {
    const events: any[] = [];

    stream$.subscribe({
      next: (event) => events.push(event),
      error: reject,
      complete: () => resolve(events)
    });
  });

class ThemeServiceStub {
  private readonly themeChangedSubject = new BehaviorSubject<void>(undefined);
  readonly themeChanged$ = this.themeChangedSubject.asObservable();
  readonly theme = { type: 'custom' } as const;
  getLuzmoDashboardTheme = vi.fn().mockReturnValue(this.theme);
}

class LanguageServiceStub {
  private readonly languageSubject = new BehaviorSubject<Language>('en');
  readonly currentLanguage$ = this.languageSubject.asObservable();

  getCurrentLanguage = vi.fn().mockReturnValue('en');
  translate = vi.fn((key: string) => key);
}

describe('LuzmoApiService', () => {
  let service: LuzmoApiService;
  let httpMock: HttpTestingController;
  let themeService: ThemeServiceStub;
  let languageService: LanguageServiceStub;
  const encoder = new TextEncoder();

  const createStreamResponse = (chunks: string[]) => {
    let index = 0;
    const cancel = vi.fn().mockResolvedValue(undefined);
    const reader = {
      read: vi.fn().mockImplementation(() => {
        if (index < chunks.length) {
          const value = encoder.encode(chunks[index]);

          index += 1;

          return Promise.resolve({ done: false, value });
        }

        return Promise.resolve({ done: true, value: undefined });
      }),
      cancel
    };

    return {
      response: {
        ok: true,
        body: {
          getReader: () => reader
        }
      },
      reader
    };
  };

  const demoUser: User = {
    name: 'Corey Santiago',
    firstName: 'Corey',
    title: 'VP Sales',
    initials: 'CS',
    appTheme: 'dark',
    language: 'en'
  } as User;

  beforeEach(() => {
    themeService = new ThemeServiceStub();
    languageService = new LanguageServiceStub();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        LuzmoApiService,
        { provide: ThemeService, useValue: themeService },
        { provide: LanguageService, useValue: languageService }
      ]
    });

    service = TestBed.inject(LuzmoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests embed credentials and caches them for later subscribers', async () => {
    const request$ = service.requestLuzmoCredentials(demoUser);
    const payload = {
      theme: themeService.theme,
      locale_id: 'en',
      user: demoUser
    };

    const consumerPromise = firstValueFrom(request$);
    const request = httpMock.expectOne('http://localhost:3101/api/embed');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 'abc', token: 'xyz' });

    const credentials = await consumerPromise;

    expect(credentials).toEqual({ key: 'abc', token: 'xyz' });

    const replayed = await firstValueFrom(service.getLuzmoCredentials().pipe(take(1)));

    expect(replayed).toEqual(credentials);
  });

  it('refreshes credentials using the last authenticated user', async () => {
    const initial$ = service.requestLuzmoCredentials(demoUser);
    const initialConsumerPromise = firstValueFrom(initial$);
    const initialRequest = httpMock.expectOne('http://localhost:3101/api/embed');

    initialRequest.flush({ id: 'first', token: 'token' });
    await initialConsumerPromise;

    const refresh$ = service.refreshLuzmoCredentials();
    const refreshConsumerPromise = firstValueFrom(refresh$);
    const refreshRequest = httpMock.expectOne('http://localhost:3101/api/embed');

    refreshRequest.flush({ id: 'second', token: 'token-2' });

    const refreshed = await refreshConsumerPromise;

    expect(refreshed).toEqual({ key: 'second', token: 'token-2' });
  });

  it('clears cached credentials when requested', async () => {
    const credentials$ = service.requestLuzmoCredentials(demoUser);
    const consumerPromise = firstValueFrom(credentials$);
    const initialRequest = httpMock.expectOne('http://localhost:3101/api/embed');

    initialRequest.flush({ id: 'cached', token: 'value' });
    await consumerPromise;

    service.clearLuzmoCredentials();

    const cleared = await firstValueFrom(service.getLuzmoCredentials().pipe(take(1)));

    expect(cleared).toEqual({ key: '', token: '' });
  });

  it('rejects empty IQ questions before calling fetch', async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    await expect(firstValueFrom(service.getStreamedIQAnswer('   ', 'key', 'token'))).rejects.toThrow('Question cannot be empty.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aborts the active IQ stream when cancelled', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { response } = createStreamResponse(['{"done":true}\n']);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    const subscription = service.getStreamedIQAnswer('Question', 'key', 'token').subscribe();

    service.cancelActiveIQAnswer();

    expect(abortSpy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('surfaces IQ API errors when the response is not ok', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('Boom')
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(firstValueFrom(service.getStreamedIQAnswer('Question', 'key', 'token'))).rejects.toThrow(
      'IQ Answer API request failed with status 500: Boom'
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('surfaces IQ API errors when the response body is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: null
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(firstValueFrom(service.getStreamedIQAnswer('Question', 'key', 'token'))).rejects.toThrow(
      'IQ Answer API response has no body to read.'
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('parses streamed IQ lines into state, chunk, and chart events and stops on done', async () => {
    const { response, reader } = createStreamResponse([
      '{"state":"gatheringMetrics"}\n{"chunk":"Hello ',
      '"}\n{"text":"World"}\n',
      '{"chart":{"type":"bar","slots":[],"options":{}}}\n{"done":true}\n{"chunk":"ignored"}\n'
    ]);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    const events = await collectStream(service.getStreamedIQAnswer('Question', 'key', 'token'));

    expect(events).toEqual([
      { type: 'state', state: 'gatheringMetrics' },
      { type: 'chunk', text: 'Hello ' },
      { type: 'chunk', text: 'World' },
      { type: 'chart', chart: { type: 'bar', slots: [], options: {} } }
    ]);
    expect(reader.cancel).toHaveBeenCalled();
  });

  it('caches AI summary streams for the same identifier', async () => {
    const credentials$ = service.requestLuzmoCredentials(demoUser);
    const credentialsPromise = firstValueFrom(credentials$);
    const authRequest = httpMock.expectOne('http://localhost:3101/api/embed');

    authRequest.flush({ id: 'summary', token: 'token' });
    await credentialsPromise;

    const { response } = createStreamResponse(['{"done":true}\n']);
    const fetchMock = vi.fn().mockResolvedValue(response);

    vi.stubGlobal('fetch', fetchMock);

    const first$ = service.getStreamedAISummary('key', 'token');
    const second$ = service.getStreamedAISummary('key', 'token');

    expect(first$).toBe(second$);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears cached AI summary streams when the response body is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const missingBodyResponse = { ok: true, body: null };
    const { response } = createStreamResponse(['{"done":true}\n']);
    const fetchMock = vi.fn().mockResolvedValueOnce(missingBodyResponse).mockResolvedValueOnce(response);

    vi.stubGlobal('fetch', fetchMock);

    await expect(firstValueFrom(service.getStreamedAISummary('key', 'token'))).rejects.toThrow(
      'AI Summary API response has no body to read.'
    );

    await collectStream(service.getStreamedAISummary('key', 'token'));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalled();
  });
});
