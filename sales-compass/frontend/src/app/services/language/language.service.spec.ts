import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(LanguageService);
    document.documentElement.lang = 'en';
  });

  it('sets the current language and updates the document lang attribute', () => {
    const emissions: string[] = [];
    const subscription = service.currentLanguage$.subscribe((lang) => emissions.push(lang));

    service.setLanguage('fr');

    expect(emissions.at(-1)).toBe('fr');
    expect(service.getCurrentLanguage()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    subscription.unsubscribe();
  });

  it('translates known keys and replaces interpolation params', () => {
    service.setLanguage('en');

    const translated = service.translate('report-builder.dashboard-saved-successfully', {
      dashboardName: 'Velocity'
    });

    expect(translated).toContain('Velocity');
    expect(translated.toLowerCase()).toContain('dashboard');
  });

  it('returns the input when the key has no translation namespace', () => {
    const key = 'unknown-key';

    expect(service.translate(key)).toBe(key);
  });

  it('ignores unsupported languages', () => {
    const emissions: string[] = [];
    const subscription = service.currentLanguage$.subscribe((lang) => emissions.push(lang));

    service.setLanguage('jp' as any);

    expect(service.getCurrentLanguage()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(emissions.at(-1)).toBe('en');
    subscription.unsubscribe();
  });

  it('returns the correct currency symbol for the current language', () => {
    service.setLanguage('en');

    expect(service.getCurrencySymbol()).toBe('$');

    service.setLanguage('fr');

    expect(service.getCurrencySymbol()).toBe('€');
  });
});
