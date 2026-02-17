import { Injectable, signal } from '@angular/core';
import { ThemeConfig } from '@luzmo/dashboard-contents-types';
import { Subject } from 'rxjs';

import { THEME_PRESETS } from './theme-presets';

export type AppTheme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryDarker: string;
  primaryLighter: string;
  primaryInverse: string;
  secondary: string;
  secondaryLighter: string;
  secondaryDarker: string;
  secondaryInverse: string;
  surface: string;
  surfaceRaised: string;
  textDimmed: string;
  text: string;
  textActive: string;
  borderLight: string;
  border: string;
  borderHard: string;
  primaryRgb?: string;
  secondaryRgb?: string;
}

export interface ColorConfig {
  cssVar: string;
  propName: keyof ThemeColors;
  translationKey: string;
  noAlphaChannel: boolean;
}

export interface ThemePreset {
  id: string;
  translationKey: string;
  colors: ThemeColors;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeChangedSubject = new Subject<void>();

  readonly colorConfigs: ColorConfig[] = [
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
      cssVar: '--color-primary-inverse',
      propName: 'primaryInverse',
      translationKey: 'theme.primary-inverse',
      noAlphaChannel: true
    },
    {
      cssVar: '--color-secondary',
      propName: 'secondary',
      translationKey: 'theme.secondary-color',
      noAlphaChannel: true
    },
    {
      cssVar: '--color-secondary-lighter',
      propName: 'secondaryLighter',
      translationKey: 'theme.secondary-lighter',
      noAlphaChannel: true
    },
    {
      cssVar: '--color-secondary-darker',
      propName: 'secondaryDarker',
      translationKey: 'theme.secondary-darker',
      noAlphaChannel: true
    },
    {
      cssVar: '--color-secondary-inverse',
      propName: 'secondaryInverse',
      translationKey: 'theme.secondary-inverse',
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
      cssVar: '--color-text-dimmed',
      propName: 'textDimmed',
      translationKey: 'theme.text-dimmed',
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
      cssVar: '--color-border-light',
      propName: 'borderLight',
      translationKey: 'theme.border-light',
      noAlphaChannel: false
    },
    {
      cssVar: '--color-border-hard',
      propName: 'borderHard',
      translationKey: 'theme.border-hard',
      noAlphaChannel: false
    }
  ];

  /**
   * Pre-defined theme presets (imported from constants).
   */
  readonly themePresets: ThemePreset[] = THEME_PRESETS;

  /**
   * Signal to track dark mode state reactively.
   */
  readonly isDarkMode = signal(this.computeIsDarkMode());

  /**
   * Signal to track the currently active preset theme ID.
   */
  readonly activePresetId = signal<string | null>(this.detectActivePreset());

  /**
   * Signal to track whether a custom theme (not a preset) is currently active.
   * True when custom colors are saved but no preset is selected.
   */
  readonly isCustomThemeActive = signal<boolean>(this.detectCustomThemeActive());

  themeChanged$ = this.themeChangedSubject.asObservable();

  /**
   * Computes whether dark mode is active by analyzing the surface color luminance.
   * @returns True if dark mode is active, false otherwise
   */
  private computeIsDarkMode(): boolean {
    const styles = getComputedStyle(document.body);
    const surfaceColor = styles.getPropertyValue('--color-surface-raised').trim();

    if (!surfaceColor) {
      return false; // Default to light theme
    }

    const luminance = this.calculateColorLuminance(surfaceColor);

    return luminance < 0.5;
  }

  /**
   * Detects and returns the currently active preset ID from localStorage.
   * @returns The active preset ID if found, null otherwise
   */
  private detectActivePreset(): string | null {
    const savedPresetId = localStorage.getItem('active-preset-id');

    if (savedPresetId) {
      // Verify the preset still exists
      const presetExists = this.themePresets.some((p) => p.id === savedPresetId);

      return presetExists ? savedPresetId : null;
    }

    return null;
  }

  /**
   * Detects whether a custom theme (not from a preset) is currently active.
   * @returns True if custom colors exist but no preset is selected
   */
  private detectCustomThemeActive(): boolean {
    const hasCustomColors = localStorage.getItem('custom-theme-colors') !== null;
    const hasActivePreset = localStorage.getItem('active-preset-id') !== null;

    return hasCustomColors && !hasActivePreset;
  }

  /**
   * Updates the reactive signal for dark mode state.
   * Call this after any theme-related changes to ensure components get updated.
   */
  private updateThemeSignals(): void {
    this.isDarkMode.set(this.computeIsDarkMode());
  }

  /**
   * Finalizes a theme change by updating browser chrome, reactive signals, and emitting change event.
   * Call this at the end of any method that modifies the theme.
   */
  private finalizeThemeChange(): void {
    this.updateBrowserThemeColor();
    this.updateThemeSignals();
    this.themeChangedSubject.next();
  }

  /**
   * Updates the browser theme-color meta tag to match the current --color-surface CSS variable.
   * This ensures the mobile browser chrome matches the app's theme.
   */
  updateBrowserThemeColor(): void {
    const styles = getComputedStyle(document.body);
    const surfaceColor = styles.getPropertyValue('--color-surface').trim();

    if (surfaceColor) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');

      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', surfaceColor);
      }
    }
  }

  /**
   * Sets the application theme to the specified mode (light or dark).
   * @param theme - The theme mode to set ('light' or 'dark')
   */
  setAppTheme(theme: AppTheme): void {
    const shouldBeDark = theme === 'dark';
    const isDarkTheme = document.body.classList.contains('dark-theme');

    if (isDarkTheme !== shouldBeDark) {
      document.body.classList.toggle('dark-theme', shouldBeDark);
      this.finalizeThemeChange();

      return;
    }

    this.updateBrowserThemeColor();
    this.updateThemeSignals();
  }

  /**
   * Retrieves the current theme colors from CSS custom properties.
   * Reads all configured color variables and their RGB variants from the computed styles.
   * @returns Object containing all current theme color values
   */
  getCurrentThemeColors(): ThemeColors {
    const styles = getComputedStyle(document.body);
    const themeColors: Partial<ThemeColors> = {};

    this.colorConfigs.forEach((config) => {
      const colorStr = styles.getPropertyValue(config.cssVar).trim();

      themeColors[config.propName] = colorStr;
    });

    // Also get RGB variables
    const primaryRgb = styles.getPropertyValue('--color-primary-rgb').trim();
    const secondaryRgb = styles.getPropertyValue('--color-secondary-rgb').trim();

    if (primaryRgb) {
      themeColors.primaryRgb = primaryRgb;
    }

    if (secondaryRgb) {
      themeColors.secondaryRgb = secondaryRgb;
    }

    return themeColors as ThemeColors;
  }

  /**
   * Generates a Luzmo dashboard theme configuration based on current CSS custom properties.
   * Creates a complete theme object with colors, fonts, borders, and styling options.
   * @returns Complete theme configuration for Luzmo dashboards
   */
  getLuzmoDashboardTheme(): ThemeConfig {
    const styles = getComputedStyle(document.body);
    const getVar = (name: string) => styles.getPropertyValue(name).trim();

    return {
      type: 'custom',
      background: getVar('--color-surface'),
      itemsBackground: getVar('--color-surface-raised'),
      boxShadow: {
        size: 'none',
        color: 'rgb(0, 0, 0)'
      },
      title: {
        align: 'left',
        bold: false,
        italic: false,
        underline: false,
        border: false
      },
      font: {
        fontFamily: 'Poppins',
        'font-style': 'normal',
        'font-weight': 400,
        fontSize: 14
      },
      colors: [
        getVar('--color-primary-lighter'),
        getVar('--color-primary'),
        getVar('--color-primary-darker'),
        getVar('--color-secondary-lighter'),
        getVar('--color-secondary'),
        getVar('--color-secondary-darker'),
        getVar('--color-primary-lighter'),
        getVar('--color-primary'),
        getVar('--color-primary-darker'),
        getVar('--color-secondary-lighter'),
        getVar('--color-secondary'),
        getVar('--color-secondary-darker')
      ],
      borders: {
        'border-color': getVar('--color-border'),
        'border-radius': '12px',
        'border-style': 'solid',
        'border-top-width': '1px',
        'border-left-width': '1px',
        'border-bottom-width': '1px',
        'border-right-width': '1px'
      },
      mainColor: getVar('--color-primary'),
      axis: {},
      margins: [16, 16],
      legend: {
        type: 'circle'
      },
      tooltip: {
        background: getVar('--color-surface-raised'),
        opacity: 0.85,
        lineHeight: 1.75
      },
      itemSpecific: {
        rounding: 8,
        padding: 4
      }
    };
  }

  /**
   * Generates a Luzmo dashboard theme with borders disabled.
   * Useful for charts that need to be embedded without visible borders.
   * @param itemsBackground - Optional custom background for chart items
   * @returns Theme configuration with 'border-style' set to 'none'
   */
  getLuzmoDashboardThemeNoBorders(itemsBackground?: string): ThemeConfig {
    const theme = this.getLuzmoDashboardTheme();

    if (itemsBackground) {
      theme.itemsBackground = itemsBackground;
    }

    theme.borders = {
      ...theme.borders,
      'border-style': 'none'
    };

    return theme;
  }

  /**
   * Loads and applies any custom theme colors that were previously saved in localStorage.
   * Also restores the active preset ID if one was saved, or marks as custom theme.
   * Silently handles errors if the saved data is corrupted or invalid.
   */
  loadSavedCustomTheme(): void {
    try {
      const savedColors = localStorage.getItem('custom-theme-colors');

      if (savedColors) {
        const themeColors: ThemeColors = JSON.parse(savedColors);

        this.applyThemeColors(themeColors);
      }

      // Restore active preset ID or detect custom theme
      const savedPresetId = this.detectActivePreset();

      if (savedPresetId) {
        this.activePresetId.set(savedPresetId);
        this.isCustomThemeActive.set(false);
      } else {
        // Custom colors exist but no preset - this is a custom theme
        this.isCustomThemeActive.set(this.detectCustomThemeActive());
      }
    } catch (error) {
      console.error('Error loading custom theme:', error);
    }
  }

  /**
   * Extracts theme colors from a URL query parameter and applies them to the current theme.
   * Expects a base64-encoded JSON object in the 'theme' query parameter.
   * @param url - The URL to parse for theme parameters
   */
  applyThemeFromUrl(url: string): void {
    try {
      const urlObj = new URL(url);
      const themeParam = urlObj.searchParams.get('theme');

      if (themeParam) {
        // Decode the base64 encoded theme colors
        const decodedColors = atob(themeParam);
        const themeColors: ThemeColors = JSON.parse(decodedColors);

        this.applyThemeColors(themeColors);
      }
    } catch (error) {
      console.error('Error applying theme from URL:', error);
    }
  }

  /**
   * Saves theme colors to localStorage and applies them to the current theme.
   * Automatically calculates RGB values for primary and secondary colors.
   * When saving custom colors (not from a preset), clears the active preset.
   * @param colors - The theme colors to save and apply
   * @param fromPreset - If true, this is being called from applyPreset and shouldn't clear the preset ID
   */
  saveThemeColors(colors: ThemeColors, fromPreset = false): void {
    const colorsWithRgb = this.addRgbValues(colors);

    localStorage.setItem('custom-theme-colors', JSON.stringify(colorsWithRgb));

    // When saving custom colors (not from a preset), clear the active preset
    if (!fromPreset) {
      localStorage.removeItem('active-preset-id');
      this.activePresetId.set(null);
      this.isCustomThemeActive.set(true);
    }

    this.applyThemeColors(colorsWithRgb);
  }

  /**
   * Resets all theme colors to their default values by removing custom CSS properties.
   * Clears saved custom colors from localStorage and emits a theme change event.
   */
  resetToDefaultColors(): void {
    localStorage.removeItem('custom-theme-colors');
    localStorage.removeItem('active-preset-id');

    // Remove all custom color properties
    this.colorConfigs.forEach((config) => {
      document.body.style.removeProperty(config.cssVar);
    });

    // Also remove RGB variables
    document.body.style.removeProperty('--color-primary-rgb');
    document.body.style.removeProperty('--color-secondary-rgb');

    this.activePresetId.set(null);
    this.isCustomThemeActive.set(false);
    this.finalizeThemeChange();
  }

  /**
   * Applies a theme preset by its ID.
   * Saves the preset colors and updates the active preset tracking.
   * @param presetId - The ID of the preset to apply
   */
  applyPreset(presetId: string): void {
    const preset = this.themePresets.find((p) => p.id === presetId);

    if (preset) {
      this.saveThemeColors(preset.colors, true);
      localStorage.setItem('active-preset-id', presetId);
      this.activePresetId.set(presetId);
      this.isCustomThemeActive.set(false);
    }
  }

  /**
   * Applies the provided theme colors to CSS custom properties on the document body.
   * Handles both regular color properties and RGB variants for primary/secondary colors.
   * @param themeColors - The theme colors to apply
   */
  applyThemeColors(themeColors: Partial<ThemeColors>): void {
    // Apply regular color properties
    Object.entries(themeColors).forEach(([propName, colorValue]: [string, string]) => {
      if (propName === 'primaryRgb' || propName === 'secondaryRgb') {
        return; // Skip RGB properties, handled separately
      }

      const cssVar = this.propNameToCssVar(propName);

      if (cssVar) {
        document.body.style.setProperty(cssVar, colorValue);
      }
    });

    // Apply RGB variants
    this.applyRgbVariants(themeColors);
    this.finalizeThemeChange();
  }

  /**
   * Converts a theme color property name to its corresponding CSS custom property name.
   * @param propName - The property name from ThemeColors interface
   * @returns The corresponding CSS custom property name (e.g., '--color-primary')
   */
  private propNameToCssVar(propName: string): string {
    const config = this.colorConfigs.find((c) => c.propName === propName);

    return config ? config.cssVar : '';
  }

  /**
   * Extracts RGB values from any CSS color format and returns them as a comma-separated string.
   * Uses a temporary DOM element to let the browser parse and normalize the color value.
   * @param color - The color value in any CSS-supported format
   * @returns RGB values as "r, g, b" string, or null if parsing fails
   */
  private extractRgbValues(color: string): string | null {
    const tempElement = document.createElement('div');

    tempElement.style.color = color;
    document.body.append(tempElement);

    const computedColor = getComputedStyle(tempElement).color;

    tempElement.remove();

    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    return rgbMatch ? `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}` : null;
  }

  /**
   * Calculates the relative luminance of a color for determining if it's light or dark.
   * @param color - The color value to analyze
   * @returns Luminance value between 0 (dark) and 1 (light)
   */
  private calculateColorLuminance(color: string): number {
    const tempElement = document.createElement('div');

    tempElement.style.color = color;
    document.body.append(tempElement);

    const computedColor = getComputedStyle(tempElement).color;

    tempElement.remove();

    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    if (!rgbMatch) {
      return 1; // Default to light if parsing fails
    }

    const [, r, g, b] = rgbMatch.map(Number);

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * Adds RGB values to theme colors for primary and secondary colors.
   * @param colors - The theme colors to enhance with RGB values
   * @returns Colors object with RGB values added
   */
  private addRgbValues(colors: ThemeColors): ThemeColors {
    const colorsWithRgb = { ...colors };

    if (colors.primary) {
      const primaryRgb = this.extractRgbValues(colors.primary);

      if (primaryRgb) {
        colorsWithRgb.primaryRgb = primaryRgb;
      }
    }

    if (colors.secondary) {
      const secondaryRgb = this.extractRgbValues(colors.secondary);

      if (secondaryRgb) {
        colorsWithRgb.secondaryRgb = secondaryRgb;
      }
    }

    return colorsWithRgb;
  }

  /**
   * Applies RGB variants for primary and secondary colors to CSS custom properties.
   * @param themeColors - The theme colors containing RGB values
   */
  private applyRgbVariants(themeColors: Partial<ThemeColors>): void {
    // Handle primary color RGB
    if (themeColors.primary) {
      const rgbValues = themeColors.primaryRgb || this.extractRgbValues(themeColors.primary);

      if (rgbValues) {
        document.body.style.setProperty('--color-primary-rgb', rgbValues);
      }
    } else if (themeColors.primaryRgb) {
      document.body.style.setProperty('--color-primary-rgb', themeColors.primaryRgb);
    }

    // Handle secondary color RGB
    if (themeColors.secondary) {
      const rgbValues = themeColors.secondaryRgb || this.extractRgbValues(themeColors.secondary);

      if (rgbValues) {
        document.body.style.setProperty('--color-secondary-rgb', rgbValues);
      }
    } else if (themeColors.secondaryRgb) {
      document.body.style.setProperty('--color-secondary-rgb', themeColors.secondaryRgb);
    }
  }
}
