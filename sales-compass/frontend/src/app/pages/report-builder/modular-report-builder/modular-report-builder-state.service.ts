import { computed, DestroyRef, ElementRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { switchItem } from '@luzmo/analytics-components-kit';
import { transformFilters, type EditFiltersFilterGroup } from '@luzmo/analytics-components-kit/utils';
import { FilterGroup, VizItemType, Slot, SlotConfig, VizItemOptions } from '@luzmo/dashboard-contents-types';
import {
  luzmoAngleLeft,
  luzmoAngleRight,
  luzmoBarchart,
  luzmoCheck,
  luzmoClose,
  luzmoCog,
  luzmoDashboard,
  luzmoEdit,
  luzmoExclamationCircle,
  luzmoFilter,
  luzmoFont,
  luzmoPlus,
  luzmoRetry,
  luzmoSliderHorizontal,
  luzmoStar
} from '@luzmo/icons';
import { filter, switchMap, take } from 'rxjs/operators';

import {
  COLUMN_ID_DEAL_STAGE,
  COLUMN_ID_SALES_REP_NAME,
  COLUMN_ID_COMPANY_NAME,
  COLUMN_ID_DEAL_AMOUNT,
  COLUMN_ID_WIN_PROBABILITY,
  COLUMN_ID_EXPECTED_CLOSE_DATE,
  DATASET_ID
} from '../../../constants/luzmo-constants';
import { LanguageService } from '../../../services/language/language.service';
import { LuzmoApiService } from '../../../services/luzmo-api/luzmo-api.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { DashboardConfig, DeepPartial, LuzmoChartConfig, LuzmoEmbedCredentials, LuzmoFlexChart } from '../../../types';
import {
  getEmptyDashboardConfig,
  getLuzmoChartConfig,
  isLuzmoChartType,
  luzmoCharts,
  LuzmoGridItem
} from './modular-report-builder-helper';

export type ModularReportBuilderMode = 'chart-builder' | 'ai-description' | 'popular-insights';

@Injectable()
export class ReportBuilderStateService {
  private languageService = inject(LanguageService);
  private luzmoApiService = inject(LuzmoApiService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  // Icons
  luzmoEdit = luzmoEdit;
  luzmoPlus = luzmoPlus;
  luzmoCheck = luzmoCheck;
  luzmoAngleLeft = luzmoAngleLeft;
  luzmoAngleRight = luzmoAngleRight;
  luzmoExclamationCircle = luzmoExclamationCircle;
  luzmoRetry = luzmoRetry;
  luzmoFont = luzmoFont;
  luzmoStar = luzmoStar;
  luzmoSliderHorizontal = luzmoSliderHorizontal;
  luzmoBarchart = luzmoBarchart;
  luzmoDashboard = luzmoDashboard;
  luzmoCog = luzmoCog;
  luzmoFilter = luzmoFilter;
  luzmoClose = luzmoClose;

  private luzmoGrid?: ElementRef<HTMLElement>;
  private pendingGridAdditions: unknown[] = [];
  private gridReadyListener?: (event: Event) => void;
  private flushRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private flushRetryAttempts = 0;

  // === SIGNALS - Core State ===
  readonly modularReportBuilderMode = signal<ModularReportBuilderMode>('chart-builder');
  readonly dashboardConfig = signal<DashboardConfig>(getEmptyDashboardConfig());
  readonly currentlyEditingChartId = signal<string | null>(null);
  readonly currentlyEditingDashboardId = signal<string | null>(null);

  readonly luzmoEmbedCredentials = signal<LuzmoEmbedCredentials>({ token: '', key: '' });
  readonly luzmoCharts = signal<LuzmoChartConfig[]>(luzmoCharts);

  readonly activeChartType = signal<VizItemType>('funnel-chart');
  readonly activeChartSlots = signal<SlotConfig[]>([]);
  readonly activeChartSlotContents = signal<Slot[]>([]);
  readonly activeChartOptions = signal<DeepPartial<VizItemOptions>>({});
  readonly activeChartRawFilters = signal<EditFiltersFilterGroup | null>(null);
  readonly activeChartFilters = signal<FilterGroup[]>([]);

  readonly activeDatasetId = signal<string>(DATASET_ID);

  readonly aiChartDescription = signal('');
  readonly aiChartSuggestions = signal<{ title: string }[]>([]);

  // === SIGNALS - Status flags ===
  readonly generatingAIChart = signal(false);
  readonly aiPreviewReady = signal(false);
  readonly loadingDashboards = signal(true);
  readonly dashboardsError = signal(false);

  readonly currentLanguage = signal<string>(this.languageService.getCurrentLanguage());

  readonly popularInsightsCharts = signal<LuzmoFlexChart[]>([]);
  readonly currentPage = signal(1);
  readonly chartsPerPage = 4;

  readonly luzmoDashboardTheme = signal(this.themeService.getLuzmoDashboardTheme());

  readonly savedDashboardState = signal<{
    success: boolean;
    dashboardId: string | null;
    dashboardName: string | null;
  }>({
    success: false,
    dashboardId: null,
    dashboardName: null
  });

  // === COMPUTED - Derived state ===
  readonly totalPages = computed(() => Math.ceil(this.popularInsightsCharts().length / this.chartsPerPage));

  readonly paginatedInsights = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.chartsPerPage;

    return this.popularInsightsCharts().slice(startIndex, startIndex + this.chartsPerPage);
  });

  constructor() {
    this.setActiveChart('funnel-chart');

    this.languageService.currentLanguage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((language) => {
      this.currentLanguage.set(language);
    });

    this.themeService.themeChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.luzmoDashboardTheme.set(this.themeService.getLuzmoDashboardTheme());
    });

    this.luzmoApiService
      .getLuzmoCredentials()
      .pipe(
        filter((credentials) => !!credentials?.key && !!credentials?.token),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((credentials) => {
        this.luzmoEmbedCredentials.set(credentials);
      });

    // Load AI chart suggestions for the default dataset
    this.loadAIChartSuggestions(DATASET_ID);

    // Load dashboards (used to populate 'Popular Insights' section).
    this.loadDashboards();

    this.luzmoApiService
      .loadCustomChart('sales-network-chart')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chartConfig) => {
        // Add the custom chart to the list of available charts if it's not already there.
        const currentCharts = this.luzmoCharts();

        if (!currentCharts.some((chart) => chart.type === chartConfig.type)) {
          this.luzmoCharts.set([
            ...currentCharts,
            {
              ...chartConfig,
              filters: [
                {
                  condition: 'and',
                  filters: [
                    {
                      expression: '? not in ?',
                      parameters: [
                        {
                          column_id: COLUMN_ID_DEAL_STAGE,
                          dataset_id: DATASET_ID,
                          level: 1
                        },
                        ['Closed Won', 'Closed Lost']
                      ]
                    }
                  ]
                }
              ]
            }
          ]);
        }
      });

    // Read query parameters for editing
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      dashboardId?: string;
      predefined?: boolean;
    };

    // Dashboard ID provided: editing dashboard in modular mode.
    if (state?.dashboardId && !state.predefined) {
      this.loadCustomDashboard(state.dashboardId);
    }
  }

  setGridElement(element: ElementRef<HTMLElement>): void {
    // Unbind from any previous grid element before switching.
    this.unbindGridReadyListener();
    this.luzmoGrid = element;
    this.bindGridReadyListener();
    this.flushPendingGridAdditions();
  }

  clearGridElement(): void {
    this.unbindGridReadyListener();
    this.luzmoGrid = undefined;
    if (this.flushRetryTimer) {
      clearTimeout(this.flushRetryTimer);
    }
    this.flushRetryTimer = null;
    this.flushRetryAttempts = 0;
  }

  private isGridReady(): boolean {
    const gridEl = this.luzmoGrid?.nativeElement as any;

    // The component exposes a `luzmo-grid-ready` event and an internal `_initialized` flag.
    // `addGridItem()` may exist before initialization, but will throw because the internal grid element isn't there yet.
    return (
      !!gridEl && typeof gridEl.addGridItem === 'function' && !!gridEl.isConnected && gridEl._initialized === true && !!gridEl._gridElement
    );
  }

  private bindGridReadyListener(): void {
    const gridEl = this.luzmoGrid?.nativeElement as any;

    if (!gridEl) {
      return;
    }

    this.gridReadyListener = () => {
      // Defer to the next frame: the component dispatches the event right after init,
      // but we want to ensure its internal DOM is fully in place.
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => this.flushPendingGridAdditions());
      } else {
        setTimeout(() => this.flushPendingGridAdditions(), 0);
      }
    };

    // Keep listening: the grid can re-initialize on certain prop changes (theme, etc).
    gridEl.addEventListener('luzmo-grid-ready', this.gridReadyListener);
  }

  private unbindGridReadyListener(): void {
    const gridEl = this.luzmoGrid?.nativeElement as any;

    if (gridEl && this.gridReadyListener) {
      gridEl.removeEventListener('luzmo-grid-ready', this.gridReadyListener as EventListener);
    }

    this.gridReadyListener = undefined;
  }

  private scheduleFlushRetry(): void {
    if (this.flushRetryTimer) {
      return;
    }

    this.flushRetryTimer = setTimeout(() => {
      this.flushRetryTimer = null;

      if (this.pendingGridAdditions.length === 0) {
        this.flushRetryAttempts = 0;
        return;
      }

      if (this.isGridReady()) {
        this.flushPendingGridAdditions();
        this.flushRetryAttempts = 0;
        return;
      }

      // Fallback in case the `luzmo-grid-ready` event was missed.
      if (this.flushRetryAttempts++ < 20) {
        this.scheduleFlushRetry();
      }
    }, 50);
  }

  private flushPendingGridAdditions(): void {
    if (!this.isGridReady() || this.pendingGridAdditions.length === 0) {
      if (this.pendingGridAdditions.length > 0) {
        this.scheduleFlushRetry();
      }
      return;
    }

    const toAdd = this.pendingGridAdditions.splice(0, this.pendingGridAdditions.length);

    for (const item of toAdd) {
      this.addGridItemWhenReady(item);
    }
  }

  private addGridItemWhenReady(item: unknown): void {
    if (!this.isGridReady()) {
      this.pendingGridAdditions.push(item);
      this.scheduleFlushRetry();
      return;
    }

    try {
      (this.luzmoGrid!.nativeElement as any).addGridItem(item as any);
      this.refreshDashboardItemsFromGrid();
    } catch (error) {
      // If the grid was unmounted between the readiness check and the call, keep the item queued.
      this.pendingGridAdditions.push(item);
      console.warn('Failed to add item to grid, will retry once grid is available again.', error);
    }
  }

  /**
   * The grid component mutates its `items` array internally (push/splice).
   * Angular signals won't trigger updates on deep mutations, so we "poke" the signal
   * by updating `dashboardConfig.items` with a new array reference sourced from the grid.
   */
  private refreshDashboardItemsFromGrid(): void {
    const gridEl = this.luzmoGrid?.nativeElement as any;
    const items = gridEl?.items;

    if (!Array.isArray(items)) {
      return;
    }

    this.dashboardConfig.update((config) => ({
      ...config,
      items: [...items]
    }));
  }

  private loadCustomDashboard(dashboardId: string): void {
    const savedDashboards: DashboardConfig[] = JSON.parse(localStorage.getItem('saved-dashboards') || '[]');
    const customDashboard = savedDashboards.find((d) => d.id === dashboardId);

    if (customDashboard) {
      // Override loader styles on items
      const itemsWithOptions = customDashboard.items.map((item) => ({
        ...item,
        options: {
          ...item.options,
          ...this.luzmoApiService.getLuzmoFlexOptions()
        }
      }));

      this.dashboardConfig.set({
        ...customDashboard,
        items: itemsWithOptions
      });
      this.currentlyEditingDashboardId.set(customDashboard.id ?? null); // Store ID for updating on save
      this.resetChartBuilder();
    } else {
      console.error(`Custom dashboard with ID ${dashboardId} not found in localStorage.`);
    }
  }

  setActiveChart(type: VizItemType) {
    // TODO: fix switchItem usage for sales-network-chart
    if (type === ('sales-network-chart' as VizItemType)) {
      this.activeChartType.set(type);

      const chartConfig = this.luzmoCharts().find((chart) => chart.type === type);

      if (chartConfig) {
        this.activeChartSlots.set(chartConfig.slotsConfig);
        this.activeChartSlotContents.set(chartConfig.slotContents);
        this.activeChartOptions.set({ ...chartConfig.defaultOptions });
        this.activeChartRawFilters.set(null);
        this.activeChartFilters.set(chartConfig.filters ?? []);
      }
    } else {
      const newChart = switchItem({
        oldItemType: this.activeChartType(),
        newItemType: type,
        slots: this.activeChartSlotContents()
      });

      this.activeChartType.set(type);

      const chartConfig = this.luzmoCharts().find((chart) => chart.type === type);

      if (chartConfig) {
        this.activeChartSlots.set(chartConfig.slotsConfig);
        this.activeChartSlotContents.set(newChart.slots);
        this.activeChartOptions.set({ ...chartConfig.defaultOptions });
        this.activeChartRawFilters.set(null);
        this.activeChartFilters.set(chartConfig.filters ?? []);
      }
    }
  }

  onDatasetChanged(datasetId: string): void {
    this.activeDatasetId.set(datasetId);
    this.loadAIChartSuggestions(datasetId);
  }

  changeMode(mode: ModularReportBuilderMode): void {
    this.modularReportBuilderMode.set(mode);

    // Reset states
    this.aiChartDescription.set('');
    this.aiPreviewReady.set(false);
  }

  addChartToDashboard() {
    if (this.isChartEmpty() && !(this.modularReportBuilderMode() === 'ai-description' && this.aiPreviewReady())) {
      return;
    }

    const newChart: LuzmoGridItem = {
      type: this.activeChartType(),
      slots: [...this.activeChartSlotContents()],
      options: {
        ...this.activeChartOptions(),
        theme: {
          ...this.themeService.getLuzmoDashboardTheme()
        }
      },
      filters: [...this.activeChartFilters()],
      position: {
        col: 0,
        row: 0,
        sizeX: 24,
        sizeY: 24
      }
    };

    this.addGridItemWhenReady(newChart);

    // Reset chart builder to default state
    this.resetChartBuilder();
  }

  updateChart(): void {
    if (!this.isGridReady()) {
      return;
    }

    const updatedType = this.activeChartType();
    const updatedSlots = [...this.activeChartSlotContents()];
    const updatedOptions = {
      ...this.activeChartOptions(),
      theme: {
        ...this.themeService.getLuzmoDashboardTheme()
      }
    };

    const gridItem = (this.luzmoGrid!.nativeElement as any).getGridItemById(this.currentlyEditingChartId()) as {
      element: HTMLElement;
      item: LuzmoGridItem;
      luzmoElement: HTMLElement;
    };

    // Directly update the grid item
    gridItem.item.slots = updatedSlots;
    gridItem.item.options = updatedOptions;
    gridItem.item.type = updatedType;
    (gridItem.luzmoElement as any).slots = updatedSlots;
    (gridItem.luzmoElement as any).options = updatedOptions;
    (gridItem.luzmoElement as any).type = updatedType;

    // Reset edit state
    this.resetChartBuilder();
    this.currentlyEditingChartId.set(null);
  }

  resetChartBuilder() {
    const chartConfig = this.luzmoCharts().find((chart) => chart.type === this.activeChartType());

    if (chartConfig) {
      this.activeChartSlots.set(
        chartConfig.slotsConfig.map((slot: SlotConfig) => ({
          ...slot
        }))
      );
      this.activeChartOptions.set({ ...chartConfig.defaultOptions });
      this.activeChartRawFilters.set(null);
      this.activeChartFilters.set(chartConfig.filters ?? []);
      this.activeChartSlotContents.set(
        structuredClone(
          [...chartConfig.slotsConfig].map((slot) => ({
            name: slot.name,
            content: []
          }))
        )
      );
    }

    if (this.modularReportBuilderMode() === 'ai-description') {
      // Reset AI description to default state
      this.aiChartDescription.set('');
      this.aiPreviewReady.set(false);
    }
  }

  editChart(id: string, items: LuzmoGridItem[]): void {
    const activeItem = items.find((item) => item.id === id);

    if (!activeItem) {
      return;
    }

    this.currentlyEditingChartId.set(id);

    if (isLuzmoChartType(activeItem.type)) {
      this.activeChartType.set(activeItem.type);

      // Find the corresponding chart config
      const chartConfig = getLuzmoChartConfig(activeItem.type);

      if (chartConfig) {
        this.activeChartSlots.set(chartConfig.slotsConfig);
        this.activeChartSlotContents.set(structuredClone(activeItem.slots));
        this.activeChartOptions.set(structuredClone(activeItem.options));
        this.activeChartRawFilters.set(null);
        this.activeChartFilters.set(chartConfig.filters ?? []);
      }

      this.modularReportBuilderMode.set('chart-builder');
    }
  }

  isEditingChart(): boolean {
    return this.currentlyEditingChartId() !== null;
  }

  aiChartDescriptionClicked(description: string): void {
    this.aiChartDescription.set(description);
    this.generateAIChart();
  }

  onAIChartDescriptionInput(event: Event | CustomEvent<string>): void {
    this.aiChartDescription.set(this.getInputValueFromEvent(event));
  }

  onDashboardNameInput(event: Event | CustomEvent<string>): void {
    this.dashboardConfig.update((config) => ({
      ...config,
      name: this.getInputValueFromEvent(event)
    }));
  }

  generateAIChart(): void {
    if (this.generatingAIChart() || this.aiChartDescription().length === 0) {
      return;
    }

    this.generatingAIChart.set(true);
    this.aiPreviewReady.set(false);

    this.luzmoApiService
      .createAIChart(this.activeDatasetId(), this.aiChartDescription())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.type === 'chart' && response.chart) {
            const itemsBackground = getComputedStyle(document.body).getPropertyValue('--color-surface').trim();

            // Apply the default chart options from the builder to AI generated charts. Only works if the generated chart type is supported by the builder.
            const chartConfig = getLuzmoChartConfig(this.activeChartType());
            const defaultChartOptions = chartConfig?.defaultOptions ?? {};

            if (chartConfig) {
              this.activeChartSlots.set(chartConfig.slotsConfig);
            }

            this.activeChartType.set(response.chart.type);
            this.activeChartSlotContents.set(structuredClone(response.chart.slots));

            // TODO: fix typing hack
            const {
              values: _values,
              categoryLabels: _categoryLabels,
              ...displayRest
            } = (defaultChartOptions.display ?? {}) as Record<string, unknown>;

            this.activeChartOptions.set({
              ...defaultChartOptions,
              display: {
                ...displayRest,
                title: false
              },
              ...this.luzmoApiService.getLuzmoFlexOptions(itemsBackground),
              theme: this.themeService.getLuzmoDashboardThemeNoBorders(itemsBackground)
            });

            this.aiPreviewReady.set(true);
          }

          this.generatingAIChart.set(false);
        },
        error: (error) => {
          console.error('Error generating AI chart:', error);
          this.generatingAIChart.set(false);
          this.aiPreviewReady.set(false);
        }
      });
  }

  onChartOptionsChanged(options: DeepPartial<VizItemOptions>): void {
    this.activeChartOptions.set(options);
  }

  onChartFiltersChanged(rawFilter: EditFiltersFilterGroup | null): void {
    this.activeChartRawFilters.set(rawFilter);
    this.activeChartFilters.set(transformFilters(rawFilter) as FilterGroup[]);
  }

  isChartEmpty(): boolean {
    return this.activeChartSlotContents().every((slot) => slot.content.length === 0);
  }

  isSaveDisabled(): boolean {
    const config = this.dashboardConfig();

    return config.name.trim().length === 0 || config.items.length === 0;
  }

  saveDashboard(): void {
    if (!this.isGridReady()) {
      return;
    }

    // Get all charts with their positions
    const charts: LuzmoGridItem[] = (this.luzmoGrid!.nativeElement as any).items as LuzmoGridItem[];

    const dashboard: DashboardConfig = {
      id: crypto.randomUUID(),
      name: this.dashboardConfig().name,
      items: charts
    };

    // Get existing dashboards or initialize empty array
    const savedDashboards: DashboardConfig[] = JSON.parse(localStorage.getItem('saved-dashboards') || '[]');

    // Add new dashboard
    savedDashboards.push(dashboard);

    // Save back to localStorage
    localStorage.setItem('saved-dashboards', JSON.stringify(savedDashboards));

    this.savedDashboardState.set({
      success: true,
      dashboardId: dashboard.id ?? null,
      dashboardName: dashboard.name ?? null
    });

    // Reset the form
    this.dashboardConfig.set(getEmptyDashboardConfig());
  }

  viewSavedDashboard() {
    const savedState = this.savedDashboardState();

    this.router.navigate(['/performance'], {
      state: {
        dashboardId: savedState.dashboardId,
        dashboardName: savedState.dashboardName
      }
    });
  }

  updateSavedDashboard() {
    const editingId = this.currentlyEditingDashboardId();

    if (!editingId) {
      console.error('No dashboard ID found for updating');

      return;
    }

    if (!this.isGridReady()) {
      return;
    }

    // Get all charts with their positions
    const charts: LuzmoGridItem[] = (this.luzmoGrid!.nativeElement as any).items as LuzmoGridItem[];
    const updatedDashboard: DashboardConfig = {
      id: editingId,
      name: this.dashboardConfig().name,
      items: charts
    };

    const savedDashboards: DashboardConfig[] = JSON.parse(localStorage.getItem('saved-dashboards') || '[]');

    // Find and replace the dashboard with the matching ID
    const dashboardIndex = savedDashboards.findIndex((d) => d.id === editingId);

    if (dashboardIndex === -1) {
      console.error(`Dashboard with ID ${editingId} not found in localStorage`);
    } else {
      savedDashboards[dashboardIndex] = updatedDashboard;

      // Save back to localStorage
      localStorage.setItem('saved-dashboards', JSON.stringify(savedDashboards));

      this.savedDashboardState.set({
        success: true,
        dashboardId: updatedDashboard.id ?? null,
        dashboardName: updatedDashboard.name ?? null
      });
    }

    // Reset dashboard edit state
    this.currentlyEditingDashboardId.set(null);
    this.resetChartBuilder();
    this.dashboardConfig.set(getEmptyDashboardConfig());
  }

  stopDashboardEditing() {
    this.currentlyEditingDashboardId.set(null);
    this.resetChartBuilder();
    this.dashboardConfig.set(getEmptyDashboardConfig());
  }

  // Add theme to the current chart options and remove borders.
  getChartOptions(options: DeepPartial<VizItemOptions>): VizItemOptions {
    const itemsBackground = getComputedStyle(document.body).getPropertyValue('--color-surface').trim();

    return {
      ...options,
      ...this.luzmoApiService.getLuzmoFlexOptions(),
      theme: this.themeService.getLuzmoDashboardThemeNoBorders(itemsBackground)
    } as VizItemOptions;
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  addInsightToDashboard(chart: LuzmoFlexChart): void {
    this.addGridItemWhenReady({
      ...chart,
      position: {
        sizeX: 24,
        sizeY: 24
      }
    });
  }

  onGridAction(
    event: CustomEvent<{
      action: string;
      type: LuzmoFlexChart['type'];
      slots: LuzmoFlexChart['slots'];
      options: LuzmoFlexChart['options'];
      filters: LuzmoFlexChart['filters'];
      id: string;
      element: HTMLElement;
      items: LuzmoGridItem[];
    }>
  ): void {
    // Keep dashboardConfig.items in sync with grid mutations (delete/clone etc).
    this.refreshDashboardItemsFromGrid();

    if (event.detail.action === 'edit-data') {
      this.editChart(event.detail.id, event.detail.items);
    }
  }

  editPopularInsightInBuilder(chart: LuzmoFlexChart): void {
    // Find the corresponding chart config
    const chartConfig = getLuzmoChartConfig(chart.type);

    // Set the chart as the active chart
    if (chartConfig) {
      this.activeChartType.set(chart.type);
      this.activeChartSlots.set(chartConfig.slotsConfig);
      // Deep copy to avoid reference issues
      this.activeChartSlotContents.set(structuredClone(chart.slots));
      this.activeChartOptions.set(structuredClone(chart.options));
      this.activeChartRawFilters.set(null);
      this.activeChartFilters.set(structuredClone(chart.filters ?? []));

      // Switch to chart builder modularReportBuilderMode
      this.modularReportBuilderMode.set('chart-builder');
    }
  }

  loadDashboards(): void {
    this.loadingDashboards.set(true);
    this.dashboardsError.set(false);

    this.luzmoApiService
      .getLuzmoCredentials()
      .pipe(
        filter((credentials) => !!credentials?.key && !!credentials?.token),
        take(1),
        switchMap((credentials) => {
          this.luzmoEmbedCredentials.set(credentials);

          return this.luzmoApiService.loadDashboards(['f32191db-1697-4f9a-851b-26ac91ef9898', '3044b6ad-f4c5-4d8f-9398-30b728e3874b']);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (dashboards) => {
          this.loadingDashboards.set(false);

          const orderedIds = [
            'baf94062-d700-450e-ad84-4f126ca7980a',
            'ccc33aa6-662d-4ade-9842-ecfac64b97b1',
            '70b3890c-d45f-413e-a5a5-c851db504aac',
            'a6314209-4f5f-4bd8-beb7-17ace31da0cc',
            '7de67ac5-1f53-4d49-9b46-4eaa7cd3cf28',
            '82a16554-c6f2-4a60-b6d8-5af2f4d468b9',
            'd79aa4de-22fd-415e-b8ce-edffcfc775bb',
            '82fe0d0c-68cc-48cd-b356-5dd7d4d44863',
            '941bc1c8-7832-4229-bca6-c9812e7e8148',
            'f0cb2d8b-ff7d-4e3d-97c7-f9d1b71938e6',
            '52bed54a-4d3d-419c-9898-ff0f3761c261'
          ];

          const sortedCharts = dashboards
            .flatMap((dashboard) => dashboard.items)
            .filter((item) => orderedIds.includes(item.id))
            .map((item) => ({
              ...item,
              options: {
                ...item.options,
                interactivity: {
                  exportTypes: []
                }
              }
            }))
            .sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));

          const networkCustomChart: LuzmoFlexChart = {
            id: 'sales-network-custom-chart',
            type: 'sales-network-chart' as VizItemType,
            slots: [
              {
                name: 'category',
                content: [
                  {
                    columnId: COLUMN_ID_SALES_REP_NAME,
                    datasetId: DATASET_ID,
                    label: {
                      en: 'Sales rep name',
                      fr: 'Nom du commercial',
                      de: 'Name des Vertriebsmitarbeiters',
                      es: 'Nombre del representante',
                      nl: 'Naam verkoper'
                    },
                    type: 'hierarchy',
                    subtype: null,
                    lowestLevel: 0,
                    level: null
                  }
                ]
              },
              {
                name: 'name',
                content: [
                  {
                    columnId: COLUMN_ID_COMPANY_NAME,
                    datasetId: DATASET_ID,
                    label: {
                      en: 'Company name',
                      fr: "Nom de l'entreprise",
                      de: 'Firmenname',
                      es: 'Nombre de la empresa',
                      nl: 'Bedrijfsnaam'
                    },
                    type: 'hierarchy',
                    subtype: null,
                    lowestLevel: 0,
                    level: null
                  }
                ]
              },
              {
                name: 'size',
                content: [
                  {
                    columnId: COLUMN_ID_DEAL_AMOUNT,
                    datasetId: DATASET_ID,
                    label: {
                      en: 'Amount',
                      fr: 'Montant',
                      de: 'Betrag',
                      es: 'Importe',
                      nl: 'Bedrag'
                    },
                    type: 'numeric',
                    subtype: 'currency',
                    format: '.0af',
                    currency: '$'
                  }
                ]
              },
              {
                name: 'color',
                content: [
                  {
                    columnId: COLUMN_ID_WIN_PROBABILITY,
                    datasetId: DATASET_ID,
                    label: {
                      en: 'Probability',
                      fr: 'Probabilité',
                      de: 'Wahrscheinlichkeit',
                      es: 'Probabilidad',
                      nl: 'Waarschijnlijkheid'
                    },
                    type: 'numeric',
                    subtype: null,
                    format: ',.0a%'
                  }
                ]
              },
              {
                name: 'time',
                content: [
                  {
                    columnId: COLUMN_ID_EXPECTED_CLOSE_DATE,
                    datasetId: DATASET_ID,
                    label: {
                      en: 'Expected close date',
                      fr: 'Date de clôture prévue',
                      de: 'Voraussichtliches Abschlussdatum',
                      es: 'Fecha de cierre prevista',
                      nl: 'Verwachte sluitingsdatum'
                    },
                    type: 'datetime',
                    subtype: null,
                    format: '%amd~%Y',
                    lowestLevel: 5,
                    level: 5
                  }
                ]
              }
            ],
            options: {},
            filters: [
              {
                condition: 'and',
                filters: [
                  {
                    expression: '? not in ?',
                    parameters: [
                      {
                        column_id: COLUMN_ID_DEAL_STAGE,
                        dataset_id: DATASET_ID,
                        level: 1
                      },
                      ['Closed Won', 'Closed Lost']
                    ]
                  }
                ]
              }
            ]
          };

          // Insert networkCustomChart as the 7th element
          const chartsWithNetwork: LuzmoFlexChart[] = [...sortedCharts];

          chartsWithNetwork.splice(6, 0, networkCustomChart);
          this.popularInsightsCharts.set(chartsWithNetwork);
        },
        error: (error) => {
          console.error('Error loading dashboards:', error);
          this.dashboardsError.set(true);
          this.loadingDashboards.set(false);
        }
      });
  }

  loadAIChartSuggestions(datasetId: string): void {
    this.luzmoApiService
      .getAIChartSuggestions(datasetId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((suggestions) => {
        this.aiChartSuggestions.set(suggestions);
      });
  }

  private getInputValueFromEvent(event: Event | CustomEvent<string>): string {
    const detailValue = (event as CustomEvent<string>).detail;

    if (typeof detailValue === 'string') {
      return detailValue;
    }

    const target = event.target as (EventTarget & { value?: string | null }) | null;

    return target?.value ?? '';
  }
}
