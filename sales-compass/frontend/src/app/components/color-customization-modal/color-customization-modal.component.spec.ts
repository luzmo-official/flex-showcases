import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageService } from '../../services/language/language.service';
import { MODAL_REF } from '../../services/modal/modal.service';
import { ColorConfig, ThemeColors, ThemeService } from '../../services/theme/theme.service';
import { ColorCustomizationModalComponent } from './color-customization-modal.component';

// Mock Luzmo packages to avoid ESM resolution issues
vi.mock('@luzmo/lucero/color-picker', () => ({}));
vi.mock('@luzmo/lucero/button', () => ({}));
vi.mock('@luzmo/lucero/action-button', () => ({}));

const colorConfigs: ColorConfig[] = [
  {
    cssVar: '--color-primary',
    propName: 'primary',
    translationKey: 'theme.primary-color',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-primary-lighter',
    propName: 'primaryLighter',
    translationKey: 'theme.primary-lighter',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-primary-darker',
    propName: 'primaryDarker',
    translationKey: 'theme.primary-darker',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-secondary',
    propName: 'secondary',
    translationKey: 'theme.secondary-color',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-secondary-darker',
    propName: 'secondaryDarker',
    translationKey: 'theme.secondary-darker',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-surface',
    propName: 'surface',
    translationKey: 'theme.background',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-surface-raised',
    propName: 'surfaceRaised',
    translationKey: 'theme.background-raised',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-text',
    propName: 'text',
    translationKey: 'theme.text',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-text-active',
    propName: 'textActive',
    translationKey: 'theme.text-active',
    noAlphaChannel: true
  },
  {
    cssVar: '--color-border',
    propName: 'border',
    translationKey: 'theme.border',
    noAlphaChannel: false
  },
  {
    cssVar: '--color-border-hard',
    propName: 'borderHard',
    translationKey: 'theme.border-hard',
    noAlphaChannel: false
  }
];

const baseColors: ThemeColors = {
  primary: '#111111',
  primaryDarker: '#222222',
  primaryLighter: '#333333',
  primaryInverse: '#444444',
  secondary: '#555555',
  secondaryLighter: '#666666',
  secondaryDarker: '#777777',
  secondaryInverse: '#888888',
  surface: '#999999',
  surfaceRaised: '#aaaaaa',
  textDimmed: '#bbbbbb',
  text: '#cccccc',
  textActive: '#dddddd',
  borderLight: '#eeeeee',
  border: '#ffffff',
  borderHard: '#000000',
  primaryRgb: '17, 17, 17',
  secondaryRgb: '85, 85, 85'
};

class ThemeServiceStub {
  colorConfigs = colorConfigs;
  getCurrentThemeColors = vi.fn(() => ({ ...baseColors }));
  applyThemeColors = vi.fn();
  saveThemeColors = vi.fn();
  resetToDefaultColors = vi.fn();
}

class LanguageServiceStub {
  translate = vi.fn((key: string) => key);
}

const createColorEvent = (color: string): CustomEvent<{ color: string }> => {
  const event = new CustomEvent('change');
  Object.defineProperty(event, 'target', {
    value: { color }
  });
  return event as CustomEvent<{ color: string }>;
};

describe('ColorCustomizationModalComponent', () => {
  let fixture: ComponentFixture<ColorCustomizationModalComponent>;
  let component: ColorCustomizationModalComponent;
  let themeService: ThemeServiceStub;
  let modalRef: { close: ReturnType<typeof vi.fn>; dismiss: ReturnType<typeof vi.fn> };
  let router: { url: string };
  let originalClipboard: Clipboard | undefined;

  beforeEach(async () => {
    themeService = new ThemeServiceStub();
    modalRef = { close: vi.fn(), dismiss: vi.fn() };
    router = { url: '/overview?mode=ede' };
    originalClipboard = (navigator as any).clipboard;

    await TestBed.configureTestingModule({
      imports: [ColorCustomizationModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: themeService },
        { provide: LanguageService, useValue: new LanguageServiceStub() },
        { provide: Router, useValue: router },
        { provide: MODAL_REF, useValue: modalRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ColorCustomizationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true
      });
    } else {
      delete (navigator as any).clipboard;
    }
  });

  it('splits configs into columns and computes swatches from base colors', () => {
    const midpoint = Math.ceil(colorConfigs.length / 2);

    expect(component.leftColumnColorConfigs).toEqual(colorConfigs.slice(0, midpoint));
    expect(component.rightColumnColorConfigs).toEqual(colorConfigs.slice(midpoint));

    const primaryLighterConfig = colorConfigs.find((config) => config.propName === 'primaryLighter')!;
    const primaryDarkerConfig = colorConfigs.find((config) => config.propName === 'primaryDarker')!;
    const secondaryDarkerConfig = colorConfigs.find((config) => config.propName === 'secondaryDarker')!;
    const surfaceRaisedConfig = colorConfigs.find((config) => config.propName === 'surfaceRaised')!;
    const textActiveConfig = colorConfigs.find((config) => config.propName === 'textActive')!;
    const borderHardConfig = colorConfigs.find((config) => config.propName === 'borderHard')!;
    const primaryConfig = colorConfigs.find((config) => config.propName === 'primary')!;

    expect(component.getSwatchesForColorConfig(primaryLighterConfig)).toEqual([baseColors.primary]);
    expect(component.getSwatchesForColorConfig(primaryDarkerConfig)).toEqual([baseColors.primary]);
    expect(component.getSwatchesForColorConfig(secondaryDarkerConfig)).toEqual([baseColors.secondary]);
    expect(component.getSwatchesForColorConfig(surfaceRaisedConfig)).toEqual([baseColors.surface]);
    expect(component.getSwatchesForColorConfig(textActiveConfig)).toEqual([baseColors.text]);
    expect(component.getSwatchesForColorConfig(borderHardConfig)).toEqual([baseColors.border]);
    expect(component.getSwatchesForColorConfig(primaryConfig)).toEqual([]);
  });

  it('updates base colors, clears pending reset, and refreshes swatches', () => {
    const updateSpy = vi.spyOn(component as any, 'updateAllSwatches');
    (component as any).isPendingReset = true;

    component.onColorChange('primary', createColorEvent('#123456'));

    expect(component.currentThemeColors.primary).toBe('#123456');
    expect((component as any).isPendingReset).toBe(false);
    expect(updateSpy).toHaveBeenCalled();

    const primaryLighterConfig = colorConfigs.find((config) => config.propName === 'primaryLighter')!;

    expect(component.getSwatchesForColorConfig(primaryLighterConfig)).toEqual(['#123456']);
  });

  it('does not refresh swatches when non-base colors change', () => {
    const updateSpy = vi.spyOn(component as any, 'updateAllSwatches');

    component.onColorChange('primaryLighter', createColorEvent('#101010'));

    expect(component.currentThemeColors.primaryLighter).toBe('#101010');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('prepares a pending reset and swaps to default colors', () => {
    const defaultColors: ThemeColors = {
      ...baseColors,
      primary: '#999999',
      secondary: '#888888',
      surface: '#777777',
      text: '#666666',
      border: '#555555'
    };
    const removeSpy = vi.spyOn(document.body.style, 'removeProperty');
    const originalColors = { ...component.currentThemeColors };

    themeService.getCurrentThemeColors.mockReturnValueOnce({ ...defaultColors });

    component.resetToDefaults();

    expect((component as any).isPendingReset).toBe(true);
    expect(themeService.applyThemeColors).toHaveBeenCalledWith(originalColors);
    expect(component.currentThemeColors).toEqual(defaultColors);

    colorConfigs.forEach((config) => {
      expect(removeSpy).toHaveBeenCalledWith(config.cssVar);
    });
    expect(removeSpy).toHaveBeenCalledWith('--color-primary-rgb');
    expect(removeSpy).toHaveBeenCalledWith('--color-secondary-rgb');

    const primaryLighterConfig = colorConfigs.find((config) => config.propName === 'primaryLighter')!;
    expect(component.getSwatchesForColorConfig(primaryLighterConfig)).toEqual([defaultColors.primary]);
  });

  it('saves colors and closes when not pending reset', () => {
    component.saveColors();

    expect(themeService.saveThemeColors).toHaveBeenCalledWith(component.currentThemeColors);
    expect(themeService.resetToDefaultColors).not.toHaveBeenCalled();
    expect(modalRef.close).toHaveBeenCalledWith({ success: true });
  });

  it('resets to defaults on save when a pending reset is active', () => {
    (component as any).isPendingReset = true;

    component.saveColors();

    expect(themeService.resetToDefaultColors).toHaveBeenCalled();
    expect(themeService.saveThemeColors).not.toHaveBeenCalled();
    expect(modalRef.close).toHaveBeenCalledWith({ success: true, reset: true });
  });

  it('copies a shareable URL and resets the copied state after the timeout', async () => {
    vi.useFakeTimers();
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboard,
      configurable: true
    });
    const markForCheckSpy = vi.spyOn((component as any).cdr as ChangeDetectorRef, 'markForCheck');
    const currentPath = router.url.split('?')[0];
    const encodedColors = btoa(JSON.stringify(component.currentThemeColors));
    const expectedUrl = `${window.location.origin}${currentPath}?theme=${encodedColors}`;

    component.generateShareableUrl();
    const copyPromise = clipboard.writeText.mock.results[0]?.value as Promise<void> | undefined;
    if (copyPromise) {
      await copyPromise;
    }

    expect(clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    expect(component.isShareLinkCopied).toBe(true);
    expect(markForCheckSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(component.isShareLinkCopied).toBe(false);
    expect(markForCheckSpy).toHaveBeenCalledTimes(2);
  });

  it('logs an error when copying the shareable URL fails', async () => {
    const clipboard = { writeText: vi.fn().mockRejectedValue(new Error('No clipboard')) };
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboard,
      configurable: true
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.generateShareableUrl();
    const copyPromise = clipboard.writeText.mock.results[0]?.value as Promise<void> | undefined;
    if (copyPromise) {
      await copyPromise.catch(() => {});
    }

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.isShareLinkCopied).toBe(false);
  });
});
