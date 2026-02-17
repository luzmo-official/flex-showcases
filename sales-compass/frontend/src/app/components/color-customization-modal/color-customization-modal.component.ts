import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { luzmoCheck, luzmoClose, luzmoRetry, luzmoShare } from '@luzmo/icons';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { MODAL_REF, ModalRef } from '../../services/modal/modal.service';
import { ColorConfig, ThemeColors, ThemeService } from '../../services/theme/theme.service';

import '@luzmo/lucero/color-picker';
import '@luzmo/lucero/button';
import '@luzmo/lucero/action-button';

@Component({
  selector: 'app-color-customization-modal',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './color-customization-modal.component.html'
})
export class ColorCustomizationModalComponent {
  public activeModal = inject(MODAL_REF) as ModalRef<ColorCustomizationModalComponent>;
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Luzmo icon definitions
  readonly luzmoClose = luzmoClose;
  readonly luzmoShareIcon = luzmoShare;
  readonly luzmoCheckIcon = luzmoCheck;
  readonly luzmoRetryIcon = luzmoRetry;

  // Theme colors and configuration
  currentThemeColors: ThemeColors;
  readonly leftColumnColorConfigs: ColorConfig[];
  readonly rightColumnColorConfigs: ColorConfig[];

  // Pre-computed swatches for each color config
  readonly colorConfigSwatches = new Map<string, string[]>();

  // Component state
  isShareLinkCopied = false;
  private isPendingReset = false;
  private readonly LINK_COPIED_TIMEOUT = 3000;

  constructor() {
    this.currentThemeColors = this.themeService.getCurrentThemeColors();

    // Split color configurations into two columns for better layout
    const colorConfigs = this.themeService.colorConfigs;
    const midpoint = Math.ceil(colorConfigs.length / 2);

    this.leftColumnColorConfigs = colorConfigs.slice(0, midpoint);
    this.rightColumnColorConfigs = colorConfigs.slice(midpoint);

    // Pre-compute swatches for all color configs
    this.updateAllSwatches();
  }

  getSwatchesForColorConfig(colorConfig: ColorConfig): string[] {
    return this.colorConfigSwatches.get(colorConfig.propName) || [];
  }

  private updateAllSwatches(): void {
    this.colorConfigSwatches.clear();

    // Set swatches for each color config
    this.themeService.colorConfigs.forEach((config) => {
      const swatches = this.computeSwatchesForConfig(config);

      this.colorConfigSwatches.set(config.propName, swatches);
    });
  }

  private computeSwatchesForConfig(colorConfig: ColorConfig): string[] {
    const swatches: string[] = [];

    switch (colorConfig.propName) {
      case 'primaryLighter':
      case 'primaryDarker': {
        if (this.currentThemeColors.primary) {
          swatches.push(this.currentThemeColors.primary);
        }

        break;
      }
      case 'secondaryLighter':
      case 'secondaryDarker': {
        if (this.currentThemeColors.secondary) {
          swatches.push(this.currentThemeColors.secondary);
        }

        break;
      }
      case 'surfaceRaised': {
        if (this.currentThemeColors.surface) {
          swatches.push(this.currentThemeColors.surface);
        }

        break;
      }
      case 'textDimmed':
      case 'textActive': {
        if (this.currentThemeColors.text) {
          swatches.push(this.currentThemeColors.text);
        }

        break;
      }
      case 'borderLight':
      case 'borderHard': {
        if (this.currentThemeColors.border) {
          swatches.push(this.currentThemeColors.border);
        }

        break;
      }
    }

    return swatches;
  }

  onColorChange(propertyName: keyof ThemeColors, event: CustomEvent<any>): void {
    this.currentThemeColors[propertyName] = (event?.target as any)?.color;
    this.isPendingReset = false;

    // Update swatches when base colors change
    if (['primary', 'secondary', 'surface', 'text', 'border'].includes(propertyName)) {
      this.updateAllSwatches();
    }
  }

  resetToDefaults(): void {
    this.isPendingReset = true;

    // Temporarily get default colors without affecting the current display
    const originalColors = { ...this.currentThemeColors };

    this.removeAllCustomProperties();

    const defaultColors = this.themeService.getCurrentThemeColors();

    this.themeService.applyThemeColors(originalColors);

    this.currentThemeColors = defaultColors;
    this.updateAllSwatches();
  }

  saveColors(): void {
    if (this.isPendingReset) {
      this.themeService.resetToDefaultColors();
      this.activeModal.close({ success: true, reset: true });

      return;
    }

    this.themeService.saveThemeColors(this.currentThemeColors);
    this.activeModal.close({ success: true });
  }

  generateShareableUrl(): void {
    const encodedColors = btoa(JSON.stringify(this.currentThemeColors));
    const currentPath = this.router.url.split('?')[0];
    const shareableUrl = `${window.location.origin}${currentPath}?theme=${encodedColors}`;

    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => this.handleSuccessfulCopy())
      .catch((error) => console.error('Failed to copy URL:', error));
  }

  private removeAllCustomProperties(): void {
    this.themeService.colorConfigs.forEach((config) => {
      document.body.style.removeProperty(config.cssVar);
    });
    document.body.style.removeProperty('--color-primary-rgb');
    document.body.style.removeProperty('--color-secondary-rgb');
  }

  private handleSuccessfulCopy(): void {
    this.isShareLinkCopied = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isShareLinkCopied = false;
      this.cdr.markForCheck();
    }, this.LINK_COPIED_TIMEOUT);
  }
}
