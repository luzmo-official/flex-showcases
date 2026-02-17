import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';

import { ThemeColors, ThemeService } from './theme.service';

const createStyleDeclaration = (values: Record<string, string>): CSSStyleDeclaration =>
  ({
    getPropertyValue: (prop: string) => values[prop] ?? ''
  }) as unknown as CSSStyleDeclaration;

const createThemeColors = (overrides: Partial<ThemeColors> = {}): ThemeColors => ({
  primary: 'rgb(10, 20, 30)',
  primaryDarker: 'rgb(8, 16, 24)',
  primaryLighter: 'rgb(12, 24, 36)',
  primaryInverse: 'rgb(255, 255, 255)',
  secondary: 'rgb(40, 50, 60)',
  secondaryLighter: 'rgb(42, 52, 62)',
  secondaryDarker: 'rgb(30, 40, 50)',
  secondaryInverse: 'rgb(255, 255, 255)',
  surface: 'rgb(240, 240, 240)',
  surfaceRaised: 'rgb(230, 230, 230)',
  textDimmed: 'rgb(120, 120, 120)',
  text: 'rgb(80, 80, 80)',
  textActive: 'rgb(20, 20, 20)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  border: 'rgba(0, 0, 0, 0.2)',
  borderHard: 'rgba(0, 0, 0, 0.3)',
  ...overrides
});

describe('ThemeService', () => {
  let service: ThemeService;
  let getComputedStyleSpy: MockInstance<typeof window.getComputedStyle>;
  let subscriptions: Subscription[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(ThemeService);
    subscriptions = [];
    getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
    localStorage.clear();
  });

  afterEach(() => {
    subscriptions.forEach((sub) => sub.unsubscribe());
    document.body.className = '';
    document.body.style.cssText = '';
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sets the requested theme, updates the meta tag, and emits a change', () => {
    const meta = document.createElement('meta');

    meta.setAttribute('name', 'theme-color');
    document.head.append(meta);

    getComputedStyleSpy.mockReturnValue(
      createStyleDeclaration({
        '--color-surface': '#0f0f0f'
      })
    );

    const events: number[] = [];

    subscriptions.push(service.themeChanged$.subscribe(() => events.push(1)));

    service.setAppTheme('dark');

    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(meta.getAttribute('content')).toBe('#0f0f0f');
    expect(events.length).toBe(1);
  });

  it('reads current colors from CSS custom properties', () => {
    getComputedStyleSpy.mockReturnValue(
      createStyleDeclaration({
        '--color-primary': '#111111',
        '--color-primary-lighter': '#222222',
        '--color-primary-darker': '#101010',
        '--color-primary-inverse': '#ffffff',
        '--color-secondary': '#333333',
        '--color-secondary-lighter': '#444444',
        '--color-secondary-darker': '#222222',
        '--color-secondary-inverse': '#dddddd',
        '--color-surface': '#fefefe',
        '--color-surface-raised': '#f0f0f0',
        '--color-text': '#010101',
        '--color-text-dimmed': '#020202',
        '--color-text-active': '#030303',
        '--color-border': '#040404',
        '--color-border-light': '#050505',
        '--color-border-hard': '#060606',
        '--color-primary-rgb': '10, 20, 30',
        '--color-secondary-rgb': '40, 50, 60'
      })
    );

    const colors = service.getCurrentThemeColors();

    expect(colors.primary).toBe('#111111');
    expect(colors.secondary).toBe('#333333');
    expect(colors.surface).toBe('#fefefe');
    expect(colors.border).toBe('#040404');
    expect(colors.primaryRgb).toBe('10, 20, 30');
    expect(colors.secondaryRgb).toBe('40, 50, 60');
  });

  it('builds a Luzmo theme configuration using current CSS variables', () => {
    getComputedStyleSpy.mockReturnValue(
      createStyleDeclaration({
        '--color-surface': '#0a0a0a',
        '--color-surface-raised': '#1a1a1a',
        '--color-primary-lighter': '#eeeeee',
        '--color-primary': '#dddddd',
        '--color-primary-darker': '#cccccc',
        '--color-secondary-lighter': '#bbbbbb',
        '--color-secondary': '#aaaaaa',
        '--color-secondary-darker': '#999999',
        '--color-border': '#888888'
      })
    );

    const theme = service.getLuzmoDashboardTheme();

    expect(theme.background).toBe('#0a0a0a');
    expect(theme.itemsBackground).toBe('#1a1a1a');
    expect(theme.colors).toBeDefined();
    expect(theme.colors?.slice(0, 6)).toEqual(['#eeeeee', '#dddddd', '#cccccc', '#bbbbbb', '#aaaaaa', '#999999']);
    expect(theme.borders).toBeDefined();
    expect(theme.borders?.['border-color']).toBe('#888888');
  });

  it('loads saved custom theme colors and marks the theme as custom', () => {
    const colors = createThemeColors();

    localStorage.setItem('custom-theme-colors', JSON.stringify(colors));

    service.loadSavedCustomTheme();

    expect(document.body.style.getPropertyValue('--color-primary')).toBe(colors.primary);
    expect(service.activePresetId()).toBeNull();
    expect(service.isCustomThemeActive()).toBe(true);
  });

  it('restores the saved preset when one is active', () => {
    const preset = service.themePresets[0];

    localStorage.setItem('custom-theme-colors', JSON.stringify(preset.colors));
    localStorage.setItem('active-preset-id', preset.id);

    service.loadSavedCustomTheme();

    expect(service.activePresetId()).toBe(preset.id);
    expect(service.isCustomThemeActive()).toBe(false);
  });

  it('applies theme colors from a URL parameter', () => {
    const colors = createThemeColors({
      primary: 'rgb(1, 2, 3)',
      secondary: 'rgb(4, 5, 6)'
    });
    const encoded = btoa(JSON.stringify(colors));

    service.applyThemeFromUrl(`https://example.com?theme=${encoded}`);

    expect(document.body.style.getPropertyValue('--color-primary')).toBe('rgb(1, 2, 3)');
    expect(document.body.style.getPropertyValue('--color-secondary')).toBe('rgb(4, 5, 6)');
    expect(document.body.style.getPropertyValue('--color-primary-rgb')).toBe('1, 2, 3');
  });

  it('ignores invalid theme URLs without throwing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.applyThemeFromUrl('https://example.com?theme=not-base64');

    expect(errorSpy).toHaveBeenCalled();
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('');
  });

  it('persists custom theme colors, clears presets, and applies RGB values', () => {
    const colors = createThemeColors({
      primary: 'rgb(1, 2, 3)',
      secondary: 'rgb(4, 5, 6)'
    });

    localStorage.setItem('active-preset-id', 'midnight');

    service.saveThemeColors(colors);

    const saved = JSON.parse(localStorage.getItem('custom-theme-colors') || '{}') as ThemeColors;

    expect(saved.primaryRgb).toBe('1, 2, 3');
    expect(saved.secondaryRgb).toBe('4, 5, 6');
    expect(localStorage.getItem('active-preset-id')).toBeNull();
    expect(service.activePresetId()).toBeNull();
    expect(service.isCustomThemeActive()).toBe(true);
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('rgb(1, 2, 3)');
    expect(document.body.style.getPropertyValue('--color-secondary-rgb')).toBe('4, 5, 6');
  });

  it('applies a preset and updates active preset tracking', () => {
    const preset = service.themePresets[0];

    service.applyPreset(preset.id);

    expect(localStorage.getItem('active-preset-id')).toBe(preset.id);
    expect(service.activePresetId()).toBe(preset.id);
    expect(service.isCustomThemeActive()).toBe(false);
    expect(document.body.style.getPropertyValue('--color-primary')).toBe(preset.colors.primary);
  });

  it('resets theme colors to defaults and clears storage', () => {
    const events: number[] = [];

    subscriptions.push(service.themeChanged$.subscribe(() => events.push(1)));

    localStorage.setItem('custom-theme-colors', JSON.stringify(createThemeColors()));
    localStorage.setItem('active-preset-id', 'midnight');
    document.body.style.setProperty('--color-primary', 'rgb(1, 2, 3)');
    document.body.style.setProperty('--color-primary-rgb', '1, 2, 3');

    service.resetToDefaultColors();

    expect(localStorage.getItem('custom-theme-colors')).toBeNull();
    expect(localStorage.getItem('active-preset-id')).toBeNull();
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('');
    expect(document.body.style.getPropertyValue('--color-primary-rgb')).toBe('');
    expect(service.activePresetId()).toBeNull();
    expect(service.isCustomThemeActive()).toBe(false);
    expect(events.length).toBe(1);
  });

  it('builds a no-border theme variant with a custom background', () => {
    getComputedStyleSpy.mockReturnValue(
      createStyleDeclaration({
        '--color-surface': '#0a0a0a',
        '--color-surface-raised': '#1a1a1a',
        '--color-primary-lighter': '#eeeeee',
        '--color-primary': '#dddddd',
        '--color-primary-darker': '#cccccc',
        '--color-secondary-lighter': '#bbbbbb',
        '--color-secondary': '#aaaaaa',
        '--color-secondary-darker': '#999999',
        '--color-border': '#888888'
      })
    );

    const theme = service.getLuzmoDashboardThemeNoBorders('rgb(9, 9, 9)');

    expect(theme.itemsBackground).toBe('rgb(9, 9, 9)');
    expect(theme.borders?.['border-style']).toBe('none');
    expect(theme.borders?.['border-color']).toBe('#888888');
  });
});
