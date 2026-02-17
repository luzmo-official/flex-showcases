import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, OnDestroy, inject, input, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { luzmoClose, luzmoEllipsisVertical, luzmoRetry } from '@luzmo/icons';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import '@luzmo/lucero/search';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/picker';
import '@luzmo/lucero/menu';
import '@luzmo/lucero/field-label';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth/auth.service';
import { Language, LanguageService } from '../../services/language/language.service';
import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';
import { ThemeService } from '../../services/theme/theme.service';
import { LuzmoEmbedCredentials, LuzmoFlexChart } from '../../types';

@Component({
  selector: 'app-header',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, TranslatePipe, RouterModule, NgxLuzmoVizItemComponent],
  templateUrl: './header.component.html',
  styles: [
    `
      .header-search:focus-within .search-overlay {
        opacity: 1;
        pointer-events: auto;
      }

      .search-overlay {
        max-height: 24rem;
        overflow-y: auto;
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
      }

      .ai-answer {
        font-size: 0.9375rem;
        line-height: 1.7;
      }

      luzmo-search {
        --luzmo-text-field-background-color: var(--color-surface-raised);
      }

      luzmo-action-button {
        --luzmo-action-button-background-color-default: var(--color-surface-raised);
      }

      luzmo-search {
        --luzmo-search-background-color: var(--color-surface-raised);
      }
    `
  ]
})
export class HeaderComponent implements OnDestroy {
  readonly headerTitle = input('');
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  private luzmoApiService = inject(LuzmoApiService);
  private languageService = inject(LanguageService);
  private elementRef = inject(ElementRef<HTMLElement>);
  private credentialsSubscription: Subscription | null = null;
  private activeQuestionSubscription: Subscription | null = null;
  private readonly luzmoCredentials = signal<LuzmoEmbedCredentials>({ key: '', token: '' });

  environment = environment;
  // Luzmo icon definitions
  luzmoEllipsisVerticalIcon = luzmoEllipsisVertical;
  luzmoClose = luzmoClose;
  luzmoRetryIcon = luzmoRetry;

  // Theme signals (mirroring sidebar)
  readonly themePresets = this.themeService.themePresets;
  readonly selectedPresetId = this.themeService.activePresetId;
  readonly isCustomThemeActive = this.themeService.isCustomThemeActive;
  readonly selectedPreset = computed(() => {
    const id = this.selectedPresetId();

    return this.themePresets.find((p) => p.id === id) ?? null;
  });

  // Default theme colors based on user's preferred theme
  readonly defaultThemeColors = computed(() => {
    const user = this.authService.getCurrentUser();
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

  // Language signal
  readonly currentLanguage = toSignal(this.languageService.currentLanguage$);

  readonly mobileMenuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly isSearchFocused = signal(false);
  readonly isOverlayOpen = signal(false);
  readonly isStreaming = signal(false);
  readonly aiAnswer = signal('');
  readonly aiState = signal('');
  readonly aiError = signal<string | null>(null);
  readonly aiChart = signal<LuzmoFlexChart | null>(null);

  constructor() {
    this.credentialsSubscription = this.luzmoApiService.getLuzmoCredentials().subscribe((credentials) => {
      this.luzmoCredentials.set(credentials?.key && credentials?.token ? credentials : { key: '', token: '' });
    });

    this.aiState.set(this.getDefaultAIState());
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.mobileMenuOpen.set(false);
    this.authService.logout();
  }

  onPresetChange(event: Event): void {
    const presetId = (event.target as HTMLElement & { value: string }).value;

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

  onLanguageChange(event: Event): void {
    const language = (event.target as HTMLElement & { value: Language }).value;

    this.languageService.setLanguage(language);
  }

  resetToDefaultTheme(): void {
    this.themeService.resetToDefaultColors();

    const user = this.authService.getCurrentUser();

    if (user) {
      this.themeService.setAppTheme(user.appTheme);
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as any;

    this.searchQuery.set(target?.value ?? '');

    // Clear AI state and close overlay when user modifies input
    this.aiAnswer.set('');
    this.aiError.set(null);
    this.aiState.set(this.getDefaultAIState());
    this.isOverlayOpen.set(false);
    this.isStreaming.set(false);

    // Cancel any active streaming request
    this.activeQuestionSubscription?.unsubscribe();
    this.activeQuestionSubscription = null;
    this.luzmoApiService.cancelActiveIQAnswer();
  }

  reopenOverlayIfNeeded(): void {
    if (this.aiAnswer() || this.aiError()) {
      this.isOverlayOpen.set(true);
    }
  }

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
    this.reopenOverlayIfNeeded();
  }

  onSearchBlur(): void {
    this.isSearchFocused.set(false);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const query = this.searchQuery().trim();

    if (!query) {
      this.closeOverlay();

      return;
    }

    const credentials = this.luzmoCredentials();

    if (!credentials.key || !credentials.token) {
      this.aiError.set(this.languageService.translate('overview.ai-summary-error'));
      this.aiState.set(this.getDefaultAIState());
      this.aiAnswer.set('');
      this.isOverlayOpen.set(true);
      this.isStreaming.set(false);

      return;
    }

    this.isOverlayOpen.set(true);
    this.isStreaming.set(true);
    this.aiAnswer.set('');
    this.aiError.set(null);
    this.aiState.set(this.getDefaultAIState());

    this.activeQuestionSubscription?.unsubscribe();
    this.luzmoApiService.cancelActiveIQAnswer();

    this.activeQuestionSubscription = this.luzmoApiService.getStreamedIQAnswer(query, credentials.key, credentials.token).subscribe({
      next: (response) => {
        if (response.type === 'state') {
          this.aiState.set(this.formatAIState(response.state));
        } else if (response.type === 'chunk') {
          this.aiAnswer.update((v) => v + response.text);
        } else if (response.type === 'chart') {
          const background = getComputedStyle(document.body).getPropertyValue('--color-surface').trim();

          this.aiChart.set({
            ...response.chart,
            options: {
              ...response.chart.options,
              ...this.luzmoApiService.getLuzmoFlexOptions(background)
            }
          });
        }
      },
      error: (error) => {
        this.isStreaming.set(false);
        this.aiError.set(error?.message || this.languageService.translate('overview.ai-summary-error'));
      },
      complete: () => {
        this.isStreaming.set(false);
      }
    });
  }

  closeOverlay(): void {
    this.isOverlayOpen.set(false);
    this.isStreaming.set(false);
    this.activeQuestionSubscription?.unsubscribe();
    this.activeQuestionSubscription = null;
    this.luzmoApiService.cancelActiveIQAnswer();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const clickedInside = target && this.elementRef.nativeElement.contains(target);

    // Close mobile menu if clicking outside
    if (this.mobileMenuOpen() && !clickedInside) {
      this.closeMobileMenu();
    }

    // Close search overlay if clicking outside
    if (this.isOverlayOpen() && !clickedInside) {
      this.closeOverlay();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }

    if (this.isOverlayOpen()) {
      this.closeOverlay();
    }
  }

  ngOnDestroy(): void {
    this.credentialsSubscription?.unsubscribe();
    this.activeQuestionSubscription?.unsubscribe();
    this.luzmoApiService.cancelActiveIQAnswer();
  }

  private formatAIState(state: string): string {
    if (!state) {
      return this.getDefaultAIState();
    }

    const normalizedKey = state
      .replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replaceAll(/[_\s]+/g, '-')
      .toLowerCase();

    const translationKey = `overview.ai-state-${normalizedKey}`;
    const translated = this.languageService.translate(translationKey);

    if (translated !== translationKey) {
      return translated;
    }

    const normalizedLabel = state
      .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replaceAll(/[_-]+/g, ' ')
      .trim();

    if (!normalizedLabel) {
      return this.getDefaultAIState();
    }

    return normalizedLabel.charAt(0).toUpperCase() + normalizedLabel.slice(1);
  }

  private getDefaultAIState(): string {
    return this.languageService.translate('overview.ai-state-gathering-metrics');
  }
}
