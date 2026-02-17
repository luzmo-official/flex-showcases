import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { luzmoAlert, luzmoClose } from '@luzmo/icons';
import '@luzmo/lucero/picker';
import '@luzmo/lucero/button';
import '@luzmo/lucero/icon';
import { Filter, IQChatOptions, NgxLuzmoIQChatComponent, NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { filter, merge, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { COLUMN_ID_SUBREGION, DATASET_ID } from '../../constants/luzmo-constants';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth/auth.service';
import { LanguageService } from '../../services/language/language.service';
import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';
import { ThemeService } from '../../services/theme/theme.service';
import { LuzmoEmbedCredentials, LuzmoFlexChart } from '../../types';
import { createActualRevenueChart, createExpectedRevenueChart, createRevenueEvolutionChart } from './luzmo-charts';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, RouterModule, NgxLuzmoIQChatComponent, NgxLuzmoVizItemComponent, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './overview.component.html'
})
export class OverviewComponent implements OnInit, OnDestroy {
  private luzmoApiService = inject(LuzmoApiService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  public languageService = inject(LanguageService);
  public authService = inject(AuthService);

  readonly currentUser = toSignal(this.authService.currentUser$);

  environment = environment;
  readonly subregions = signal<{ id: string; name: Record<string, string> }[]>([]);
  chart1 = viewChild<NgxLuzmoVizItemComponent>('actualRevenueChart');
  chart2 = viewChild<NgxLuzmoVizItemComponent>('expectedRevenueChart');
  chart3 = viewChild<NgxLuzmoVizItemComponent>('revenueEvolutionChart');

  readonly luzmoAISummary = signal('');
  readonly luzmoAIState = signal(this.languageService.translate('overview.ai-state-gathering-metrics'));
  readonly luzmoAISummaryError = signal(false);
  readonly luzmoEmbedCredentials = signal<LuzmoEmbedCredentials>({ token: '', key: '' });
  luzmoRevenueEvolutionChart: LuzmoFlexChart = createRevenueEvolutionChart(
    this.luzmoApiService.getLuzmoFlexOptions(),
    this.languageService.getCurrencySymbol()
  );
  luzmoExpectedRevenueChart: LuzmoFlexChart = createExpectedRevenueChart(
    this.luzmoApiService.getLuzmoFlexOptions(),
    this.languageService.getCurrencySymbol()
  );
  luzmoActualRevenueChart: LuzmoFlexChart = createActualRevenueChart(
    this.luzmoApiService.getLuzmoFlexOptions(),
    this.languageService.getCurrencySymbol()
  );
  luzmoIQOptions: IQChatOptions = {
    locale: this.languageService.getCurrentLanguage(),
    displayMode: 'fullChat',
    isDisclaimerVisible: false,
    isChartConfigurationEnabled: true,
    isConversationIdVisible: true,
    welcomeMessages: [
      { message: this.languageService.translate('overview.iq-welcome-message-1') },
      { message: this.languageService.translate('overview.iq-welcome-message-2') }
    ],
    isChartFeedbackEnabled: false,
    initialSuggestions: [
      { title: this.languageService.translate('overview.iq-suggestion-1') },
      { title: this.languageService.translate('overview.iq-suggestion-2') },
      { title: this.languageService.translate('overview.iq-suggestion-3') },
      { title: this.languageService.translate('overview.iq-suggestion-4') }
    ],
    chartTheme: this.themeService.getLuzmoDashboardTheme()
  };

  readonly subRegionFilterActive = signal(false);
  readonly subRegionFilterValue = signal<string | null>(null);

  luzmoAlert = luzmoAlert;
  luzmoClose = luzmoClose;

  constructor() {
    this.languageService.currentLanguage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((language) => {
      this.luzmoIQOptions = {
        ...this.luzmoIQOptions,
        locale: language,
        welcomeMessages: [
          { message: this.languageService.translate('overview.iq-welcome-message-1') },
          { message: this.languageService.translate('overview.iq-welcome-message-2') }
        ],
        initialSuggestions: [
          { title: this.languageService.translate('overview.iq-suggestion-1') },
          { title: this.languageService.translate('overview.iq-suggestion-2') },
          { title: this.languageService.translate('overview.iq-suggestion-3') },
          { title: this.languageService.translate('overview.iq-suggestion-4') }
        ]
      };
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Subscribe to Luzmo credentials. This chain will trigger AI summary fetching.
    // This subscription will NOT use takeUntilDestroyed, allowing it to live on.
    this.luzmoApiService
      .getLuzmoCredentials()
      .pipe(
        tap((credentials) => this.luzmoEmbedCredentials.set(credentials)),
        filter((credentials) => !!credentials && !!credentials.key && !!credentials.token),
        tap(() => {
          // Reset states before attempting to fetch AI summary
          this.luzmoAISummary.set('');
          this.luzmoAIState.set(this.languageService.translate('overview.ai-state-gathering-metrics'));
          this.luzmoAISummaryError.set(false);
        }),
        switchMap((credentials) => this.luzmoApiService.getStreamedAISummary(credentials.key, credentials.token))
      )
      .subscribe({
        next: (response) => {
          // If we receive data, ensure error state is false
          if (this.luzmoAISummaryError()) {
            this.luzmoAISummaryError.set(false);
          }

          if (response.type === 'state') {
            this.luzmoAIState.set(this.formatAIState(response.state));
          } else if (response.type === 'chunk') {
            this.luzmoAISummary.update((current) => current + response.text);
          }
        },
        error: () => {
          this.luzmoAISummaryError.set(true);
          this.luzmoAIState.set(this.languageService.translate('overview.ai-summary-error'));
          this.luzmoAISummary.set('');
        }
      });

    this.luzmoApiService
      .querySubregions(this.authService.getCurrentUser())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.subregions.set(response?.data?.length ? response.data.map((row) => ({ id: row[0].id, name: row[0].name })) : []);
      });

    // Set correct theme or language to active Flex Charts when either changes.
    merge(this.themeService.themeChanged$, this.languageService.currentLanguage$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateFlexOptions();
      });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnDestroy(): void {}

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return this.languageService.translate('overview.good-morning');
    } else if (hour >= 12 && hour < 17) {
      return this.languageService.translate('overview.good-afternoon');
    } else if (hour >= 17 && hour < 22) {
      return this.languageService.translate('overview.good-evening');
    }

    return this.languageService.translate('overview.good-night');
  }

  getCurrentDateFormatted(): string {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      nl: 'nl-NL',
      de: 'de-DE',
      es: 'es-ES'
    };
    const locale = localeMap[this.languageService.getCurrentLanguage()] || 'en-US';
    return new Date().toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  navigateToPerformance(): void {
    this.router.navigate(['/performance']);
  }

  onSubregionFilterChange(event: CustomEvent<string> | null): void {
    const clearFilter = () => {
      this.luzmoActualRevenueChart.filters?.[0]?.filters?.pop();
      this.luzmoExpectedRevenueChart.filters?.[0]?.filters?.pop();
      this.luzmoRevenueEvolutionChart.filters?.[0]?.filters?.pop();
      this.subRegionFilterActive.set(false);
      this.subRegionFilterValue.set(null);
    };

    // "X" button clicked: clear filter.
    if (event === null) {
      if (this.subRegionFilterActive()) {
        clearFilter();
      }
    } else {
      // If a filter is already active, remove it first.
      if (this.subRegionFilterActive()) {
        clearFilter();
      }

      if (!this.subRegionFilterActive()) {
        const filterValue = event?.detail;
        const subregionFilter: Filter = {
          expression: '? = ?',
          parameters: [
            {
              column_id: COLUMN_ID_SUBREGION,
              dataset_id: DATASET_ID,
              level: 1
            },
            filterValue
          ]
        };

        this.luzmoActualRevenueChart.filters?.[0]?.filters?.push(subregionFilter);
        this.luzmoExpectedRevenueChart.filters?.[0]?.filters?.push(subregionFilter);
        this.luzmoRevenueEvolutionChart.filters?.[0]?.filters?.push(subregionFilter);
        this.subRegionFilterActive.set(true);
        this.subRegionFilterValue.set(filterValue);
      }
    }
  }

  private formatAIState(state: string): string {
    if (!state) {
      return this.languageService.translate('overview.ai-state-gathering-metrics');
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
      return this.languageService.translate('overview.ai-state-gathering-metrics');
    }

    return normalizedLabel.charAt(0).toUpperCase() + normalizedLabel.slice(1);
  }

  private updateFlexOptions(): void {
    const itemsBackground = getComputedStyle(document.body).getPropertyValue('--color-surface').trim();

    this.luzmoIQOptions = {
      ...this.luzmoIQOptions,
      chartTheme: {
        ...this.themeService.getLuzmoDashboardTheme(),
        itemsBackground
      }
    };

    // Force theme refresh
    this.luzmoRevenueEvolutionChart = createRevenueEvolutionChart(
      this.luzmoApiService.getLuzmoFlexOptions(itemsBackground),
      this.languageService.getCurrencySymbol()
    );
    this.luzmoExpectedRevenueChart = createExpectedRevenueChart(
      this.luzmoApiService.getLuzmoFlexOptions(itemsBackground),
      this.languageService.getCurrencySymbol()
    );
    this.luzmoActualRevenueChart = createActualRevenueChart(
      this.luzmoApiService.getLuzmoFlexOptions(itemsBackground),
      this.languageService.getCurrencySymbol()
    );

    this.cdr.markForCheck();
  }
}
