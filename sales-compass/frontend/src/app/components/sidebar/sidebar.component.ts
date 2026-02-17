import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { luzmoBracketArrowLeft, luzmoRetry } from '@luzmo/icons';
import '@luzmo/lucero/button';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/icon';
import '@luzmo/lucero/tabs';
import '@luzmo/lucero/picker';
import '@luzmo/lucero/menu';
import { filter } from 'rxjs/operators';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth/auth.service';
import { Language, LanguageService } from '../../services/language/language.service';
import { ModalService } from '../../services/modal/modal.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-sidebar',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  private isOpeningCustomThemeModal = false;

  // Luzmo icon definitions
  readonly luzmoBracketArrowLeft = luzmoBracketArrowLeft;
  readonly luzmoRetryIcon = luzmoRetry;

  readonly currentLanguage = toSignal(this.languageService.currentLanguage$);
  readonly currentUser = toSignal(this.authService.currentUser$);
  readonly currentRoute = signal('/overview');

  // Use signals for reactive theme state to avoid ExpressionChangedAfterItHasBeenCheckedError
  readonly isDarkMode = this.themeService.isDarkMode;

  // Theme presets
  readonly themePresets = this.themeService.themePresets;
  readonly selectedPresetId = this.themeService.activePresetId;
  readonly isCustomThemeActive = this.themeService.isCustomThemeActive;
  readonly selectedPreset = computed(() => {
    const id = this.selectedPresetId();

    return this.themePresets.find((p) => p.id === id) ?? null;
  });

  // Default theme colors based on user's preferred theme
  readonly defaultThemeColors = computed(() => {
    const user = this.currentUser();
    const isDark = user?.appTheme === 'dark';

    return isDark
      ? {
          surface: 'rgb(38, 38, 36)',
          primary: 'rgb(42, 157, 143)',
          secondary: 'rgb(222, 161, 116)',
          borderHard: 'rgba(222, 220, 209, 0.3)'
        }
      : {
          surface: 'rgb(246, 238, 227)',
          primary: 'rgb(0, 57, 59)',
          secondary: 'rgb(202, 151, 106)',
          borderHard: 'rgba(44, 44, 44, 0.3)'
        };
  });

  constructor() {
    // Set initial route
    this.currentRoute.set(this.router.url.split('?')[0]);

    // Listen to route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url.split('?')[0]);
    });
  }

  onPresetChange(event: Event): void {
    const pickerEl = event.target as HTMLElement & { value: string };
    const presetId = pickerEl.value;

    if (presetId === 'custom') {
      const desiredValue = this.getThemePickerValue();

      void this.openColorCustomizationModal();

      // Revert the picker's internal selection so "Custom theme" doesn't stay selected when the user
      // cancels the modal and the active theme is still a preset/default.
      setTimeout(() => {
        pickerEl.value = desiredValue;
      }, 0);

      return;
    }

    if (presetId === 'default') {
      this.themeService.resetToDefaultColors();

      const user = this.authService.getCurrentUser();

      if (user) {
        this.themeService.setAppTheme(user.appTheme);
      }
    } else {
      this.themeService.applyPreset(presetId);
    }
  }

  private getThemePickerValue(): string {
    if (this.isCustomThemeActive()) {
      return 'custom';
    }

    return this.selectedPresetId() ?? 'default';
  }

  setLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }

  onLanguageChange(event: Event): void {
    const language = (event.target as HTMLElement & { value: Language }).value;

    this.languageService.setLanguage(language);
  }

  logout(): void {
    this.authService.logout();
  }

  onTabChange(event: any): void {
    const selectedValue = event.target.selected;

    if (selectedValue) {
      this.router.navigate([selectedValue]);
    }
  }

  async openColorCustomizationModal(): Promise<void> {
    if (this.isOpeningCustomThemeModal) {
      return;
    }

    this.isOpeningCustomThemeModal = true;

    try {
      const { ColorCustomizationModalComponent } = await import('../color-customization-modal/color-customization-modal.component');

      this.modalService.open(ColorCustomizationModalComponent, {
        size: 'lg',
        windowClass: 'theme-settings-modal'
      });
    } finally {
      setTimeout(() => {
        this.isOpeningCustomThemeModal = false;
      }, 0);
    }
  }

  resetToDefaultTheme(): void {
    this.themeService.resetToDefaultColors();

    const user = this.authService.getCurrentUser();

    if (user) {
      this.themeService.setAppTheme(user.appTheme);
    }
  }
}
