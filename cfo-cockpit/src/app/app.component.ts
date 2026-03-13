import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import {
  API_HOST,
  APP_SERVER,
  BUSINESS_UNIT_OPTIONS,
  CURRENCY_OPTIONS,
  DATASET_ID,
  DEFAULT_FILTER_STATE,
  CFO_GRID_THEME,
  CFO_GRID_THEME_DARK,
  LEGAL_ENTITY_OPTIONS,
  PERIOD_OPTIONS,
  REGION_OPTIONS,
  SUPPORTED_VIZ_TYPES,
  VIZ_TYPE_OPTIONS,
  type VizTypeOption,
  createInitialItems,
  type GlobalFilterState,
  type ScenarioId
} from './cfo-config';
import {
  type AuthoringMode,
  type BuilderTab,
  type DashboardSnapshot,
  type ThemeMode,
  type GridItemData,
  type GridChangedDetail,
  type GridItemActionDetail,
  type LuceroOption,
  type NarrativeState,
  type OptionsChangedDetail,
  type PersistedDashboardState,
  type ReportLibraryModule,
  type SavedReportVersion,
  type SlotsContentsChangedDetail,
  type WorkspaceMode
} from './cfo-types';
import {
  ADVANCED_GRID_ACTIONS_MENU,
  GUIDED_GRID_ACTIONS_MENU,
  REPORT_LIBRARY,
  SCENARIO_DESCRIPTIONS,
  SCENARIO_OPTIONS,
  STARTER_REPORT_MODULE_IDS
} from './cfo-ui-config';
import {
  backfillNumericLabelsForLegacyCharts as backfillLegacyNumericLabels,
  compactInitialKpiTiles as compactKpiTiles,
  enforcePositionGuards as enforceGridPositionGuards,
  normalizeLegacyVizTypes as normalizeLegacyGridVizTypes,
  normalizePosition as normalizeGridPosition
} from './cfo-grid-helpers';
import {
  buildGlobalVizFilters,
  buildNarrative,
  buildVersionLabel,
  normalizeGlobalFilters
} from './cfo-view-helpers';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit, OnDestroy {
  // Persistent storage and guardrails for the showcase host.
  private readonly storageKey = 'luzmo-cfo-product-v1';
  private readonly themeStorageKey = 'luzmo-cfo-theme-mode-v1';
  private readonly maxSavedVersions = 12;
  private readonly minSizeByVizType = {
    chart: { x: 14, y: 12 },
    kpi: { x: 8, y: 6 }
  };
  private viewSyncScheduled = false;
  private resizeGuardBound = false;
  private activeResizeTile: HTMLElement | null = null;
  private isGridResizing = false;
  private pendingResizeItems: GridItemData[] | null = null;
  private readonly initialItemTemplates = createInitialItems();
  private readonly initialItemTemplatesById = new Map(
    this.initialItemTemplates.filter((item): item is GridItemData & { id: string } => Boolean(item.id)).map((item) => [item.id, item])
  );
  private readonly browserLocation = globalThis.location;
  private readonly cdr = inject(ChangeDetectorRef);
  readonly currentOrigin = this.browserLocation.origin;
  private readonly isLocalDev = this.browserLocation.hostname === 'localhost' || this.browserLocation.hostname === '127.0.0.1';
  readonly productName = 'CFO Planning Cockpit';

  readonly appServer = APP_SERVER;
  readonly apiHost = API_HOST;
  readonly gridApiHost = this.apiHost;
  readonly datasetIds = [DATASET_ID];

  readonly periodOptions = PERIOD_OPTIONS;
  readonly regionOptions = REGION_OPTIONS;
  readonly businessUnitOptions = BUSINESS_UNIT_OPTIONS;
  readonly legalEntityOptions = LEGAL_ENTITY_OPTIONS;
  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly scenarioOptions: ScenarioId[] = SCENARIO_OPTIONS;
  readonly vizTypeOptions: VizTypeOption[] = VIZ_TYPE_OPTIONS;
  readonly scenarioDescriptions: Record<ScenarioId, string> = SCENARIO_DESCRIPTIONS;
  readonly starterReportModuleIds = STARTER_REPORT_MODULE_IDS;
  readonly reportLibrary: ReportLibraryModule[] = REPORT_LIBRARY;

  readonly advancedGridActionsMenu = ADVANCED_GRID_ACTIONS_MENU;
  readonly guidedGridActionsMenu = GUIDED_GRID_ACTIONS_MENU;

  private readonly lightGridTheme = CFO_GRID_THEME;
  private readonly darkGridTheme = CFO_GRID_THEME_DARK;

  @ViewChild('gridHost', { read: ElementRef }) gridHostRef?: ElementRef<HTMLElement>;

  itemsModel: GridItemData[] = this.createDefaultItemsModel();
  private moduleIdsInReport = new Set(
    this.itemsModel.filter((item): item is GridItemData & { id: string } => Boolean(item.id)).map((item) => item.id)
  );
  gridItems: GridItemData[] = [];
  workspaceMode: WorkspaceMode = 'builder';
  authoringMode: AuthoringMode = 'guided';
  savedVersions: SavedReportVersion[] = [];
  activeVersionId = 'live';

  globalFilters: GlobalFilterState = { ...DEFAULT_FILTER_STATE };

  selectedItemId: string | null = this.itemsModel[0]?.id ?? null;
  builderTab: BuilderTab = 'data';

  lastSavedAt: string | null = null;
  themeMode: ThemeMode = 'light';

  narrative: NarrativeState = {
    headline: '',
    summary: '',
    action: ''
  };

  ngOnInit(): void {
    this.restoreThemeMode();
    this.restoreSnapshotFromStorage();

    if (!this.selectedItemId && this.itemsModel.length > 0) {
      this.selectedItemId = this.itemsModel[0]?.id ?? null;
    }

    this.refreshDerivedState();
    this.syncView();
  }

  ngOnDestroy(): void {
    this.teardownResizeGuard();
  }

  toggleThemeMode(): void {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    this.persistThemeMode();
    this.refreshDerivedState();
    this.syncView();
  }

  get gridTheme(): Record<string, unknown> {
    return this.themeMode === 'dark' ? this.darkGridTheme : this.lightGridTheme;
  }

  get selectedItem(): GridItemData | undefined {
    if (!this.selectedItemId) {
      return undefined;
    }

    return this.itemsModel.find((item) => item.id === this.selectedItemId);
  }

  get isFixedView(): boolean {
    return this.workspaceMode === 'fixed';
  }

  get activeGridActionsMenu(): ReadonlyArray<{ type: string; actions: string[] }> {
    if (this.isFixedView) {
      return [];
    }

    return this.authoringMode === 'guided' ? this.guidedGridActionsMenu : this.advancedGridActionsMenu;
  }

  get versionControlOptions(): LuceroOption[] {
    const options: LuceroOption[] = [{ value: 'live', label: 'Live Draft' }];

    for (const version of this.savedVersions) {
      options.push({
        value: version.id,
        label: version.label
      });
    }

    return options;
  }

  setBuilderTab(tab: BuilderTab): void {
    if (this.isFixedView) {
      return;
    }

    if (this.builderTab === tab) {
      return;
    }

    this.builderTab = tab;
    this.syncView();
  }

  setAuthoringMode(mode: AuthoringMode): void {
    if (this.authoringMode === mode) {
      return;
    }

    this.authoringMode = mode;

    if (this.authoringMode === 'advanced' && !this.selectedItemId && this.itemsModel.length > 0) {
      this.selectedItemId = this.itemsModel[0]?.id ?? null;
      this.syncGridSelectionHighlight();
    }

    this.syncView();
  }

  isModuleInReport(moduleId: string): boolean {
    return this.moduleIdsInReport.has(moduleId);
  }

  focusModule(moduleId: string): void {
    if (!this.isModuleInReport(moduleId)) {
      this.addModuleToReport(moduleId);
      return;
    }

    this.selectItem(moduleId);
  }

  addModuleToReport(moduleId: string): void {
    if (this.isFixedView || this.isModuleInReport(moduleId)) {
      return;
    }

    const template = this.createModuleFromTemplate(moduleId);

    if (!template) {
      return;
    }

    template.position = this.createPositionForNewModule(template);
    this.itemsModel = [...this.itemsModel, template];
    this.selectedItemId = template.id ?? null;
    this.afterStateMutation();
  }

  removeModuleFromReport(moduleId: string): void {
    if (this.isFixedView || !this.isModuleInReport(moduleId)) {
      return;
    }

    const remainingItems = this.itemsModel.filter((item) => item.id !== moduleId);
    this.itemsModel = remainingItems;

    if (this.selectedItemId === moduleId) {
      this.selectedItemId = this.itemsModel[0]?.id ?? null;
    }

    this.afterStateMutation();
  }

  setWorkspaceMode(mode: WorkspaceMode): void {
    if (this.workspaceMode === mode) {
      return;
    }

    this.workspaceMode = mode;

    if (this.isFixedView) {
      this.syncGridSelectionHighlight();
      this.syncView();
      return;
    }

    if (!this.selectedItemId) {
      this.selectedItemId = this.itemsModel[0]?.id ?? null;
    }
    this.syncGridSelectionHighlight();
    this.syncView();
  }

  setScenario(scenario: ScenarioId): void {
    if (this.globalFilters.scenario === scenario) {
      return;
    }

    this.globalFilters = {
      ...this.globalFilters,
      scenario
    };
    this.afterStateMutation();
  }

  updateFilter<Key extends keyof GlobalFilterState>(key: Key, rawValue: string): void {
    const currentValue = this.globalFilters[key];

    if (currentValue === rawValue) {
      return;
    }

    this.globalFilters = {
      ...this.globalFilters,
      [key]: rawValue
    } as GlobalFilterState;

    this.afterStateMutation();
  }

  onFilterSelectChange<Key extends keyof GlobalFilterState>(key: Key, event: Event): void {
    const value = this.readControlValue(event);

    if (!value) {
      return;
    }

    this.updateFilter(key, value);
  }

  onVizTypeChange(event: Event): void {
    const value = this.readControlValue(event);
    if (!value) {
      return;
    }

    this.switchSelectedItemType(value);
  }

  onVersionChange(event: Event): void {
    const value = this.readControlValue(event);

    if (!value) {
      return;
    }

    if (value === 'live') {
      this.activeVersionId = 'live';
      this.syncView();
      return;
    }

    this.loadSavedVersion(value);
  }

  switchSelectedItemType(newType: string): void {
    if (this.isFixedView) {
      return;
    }

    const current = this.selectedItem;

    if (!current || current.type === newType) {
      return;
    }

    this.updateItemById(current.id ?? '', (item) => ({ ...item, type: newType }));

    this.afterStateMutation();
  }

  onGridChanged(event: Event): void {
    if (this.isFixedView) {
      return;
    }

    const customEvent = event as CustomEvent<GridChangedDetail>;
    const incomingItems = customEvent.detail?.items;

    if (!incomingItems || incomingItems.length === 0) {
      return;
    }

    if (this.isGridResizing) {
      this.pendingResizeItems = structuredClone(incomingItems);
      return;
    }

    this.applyGridLayoutUpdate(incomingItems);
  }

  private applyGridLayoutUpdate(incomingItems: GridItemData[]): void {
    const incomingById = new Map(
      incomingItems.filter((item): item is GridItemData & { id: string } => Boolean(item.id)).map((item) => [item.id, item])
    );

    let didChange = false;

    const updatedModel = this.itemsModel.map((item) => {
      const itemId = item.id;
      const fromGrid = itemId ? incomingById.get(itemId) : undefined;

      if (!fromGrid?.position || !item.position) {
        return item;
      }

      const normalizedFromGrid = normalizeGridPosition(item.type, fromGrid.position, this.minSizeByVizType);

      const positionChanged =
        normalizedFromGrid.col !== item.position.col ||
        normalizedFromGrid.row !== item.position.row ||
        normalizedFromGrid.sizeX !== item.position.sizeX ||
        normalizedFromGrid.sizeY !== item.position.sizeY;

      if (!positionChanged) {
        return item;
      }

      didChange = true;

      return {
        ...item,
        position: normalizedFromGrid
      };
    });

    if (!didChange) {
      return;
    }

    this.itemsModel = updatedModel;
    this.afterLayoutMutation();
  }

  onGridItemAction(event: Event): void {
    if (this.isFixedView) {
      return;
    }

    const customEvent = event as CustomEvent<GridItemActionDetail>;
    const action = customEvent.detail?.action;
    const itemId = customEvent.detail?.id;
    const actionType = customEvent.detail?.actionType;
    const isToggleDeactivation = actionType === 'toggle' && customEvent.detail?.active === false;

    if (!action) {
      return;
    }

    if (isToggleDeactivation && ['edit-data', 'edit-options'].includes(action)) {
      return;
    }

    if (action === 'delete') {
      const targetId = customEvent.detail?.deletedId ?? itemId;

      if (targetId) {
        this.removeModuleFromReport(targetId);
      }

      return;
    }

    if (action === 'edit-data') {
      if (!itemId) {
        return;
      }

      this.selectItem(itemId, 'data');
      return;
    }

    if (action === 'edit-options') {
      if (!itemId) {
        return;
      }

      this.selectItem(itemId, 'options');
      return;
    }
  }

  onGridReady(): void {
    this.setupResizeGuard();
    this.syncGridSelectionHighlight();
  }

  onGridSurfaceClick(event: MouseEvent): void {
    if (this.isFixedView) {
      return;
    }

    const clickedItemId = this.extractGridItemIdFromEvent(event) ?? this.getGridItemIdAtPointer(event);

    if (!clickedItemId || !this.itemsModel.some((item) => item.id === clickedItemId)) {
      return;
    }

    if (this.selectedItemId === clickedItemId) {
      return;
    }

    this.selectItem(clickedItemId);
  }

  private selectItem(itemId: string, tab?: BuilderTab): void {
    if (!this.itemsModel.some((item) => item.id === itemId)) {
      return;
    }

    this.selectedItemId = itemId;
    if (tab) {
      this.builderTab = tab;
    }
    this.syncGridSelectionHighlight();
    this.syncView();
  }

  private updateItemById(itemId: string, updater: (item: GridItemData) => GridItemData): void {
    if (!itemId) {
      return;
    }

    this.itemsModel = this.itemsModel.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return updater(item);
    });
  }

  onSlotsContentsChanged(event: Event): void {
    if (this.isFixedView) {
      return;
    }

    const current = this.selectedItem;

    if (!current) {
      return;
    }

    const customEvent = event as CustomEvent<SlotsContentsChangedDetail>;
    const nextSlots = customEvent.detail?.slotsContents;

    if (!nextSlots) {
      return;
    }

    this.updateItemById(current.id ?? '', (item) => ({
      ...item,
      slots: structuredClone(nextSlots)
    }));

    this.afterStateMutation();
  }

  onSlotConstraintTriggered(event: Event): void {
    void event;
  }

  onOptionsChanged(event: Event): void {
    if (this.isFixedView) {
      return;
    }

    const current = this.selectedItem;

    if (!current) {
      return;
    }

    const customEvent = event as CustomEvent<OptionsChangedDetail>;
    const nextOptions = customEvent.detail?.options;

    if (!nextOptions) {
      return;
    }

    this.updateItemById(current.id ?? '', (item) => ({
      ...item,
      options: structuredClone(nextOptions)
    }));

    this.afterStateMutation();
  }

  saveVersion(): void {
    this.syncItemsModelFromGridState();

    const savedAt = new Date().toISOString();
    const snapshot = this.createSnapshot();
    const nextVersion: SavedReportVersion = {
      id: `version-${Date.now()}`,
      label: buildVersionLabel(savedAt, this.globalFilters.scenario),
      savedAt,
      snapshot
    };

    this.savedVersions = [nextVersion, ...this.savedVersions].slice(0, this.maxSavedVersions);
    this.activeVersionId = nextVersion.id;
    this.lastSavedAt = savedAt;
    this.persistStorage(snapshot, savedAt);
    this.syncView();
  }

  restoreDefaults(): void {
    this.itemsModel = this.createDefaultItemsModel();
    this.globalFilters = { ...DEFAULT_FILTER_STATE };
    this.selectedItemId = this.itemsModel[0]?.id ?? null;
    this.builderTab = 'data';
    this.authoringMode = 'guided';
    this.workspaceMode = 'builder';
    this.activeVersionId = 'live';

    this.afterStateMutation();
  }

  private loadSavedVersion(versionId: string): void {
    const version = this.savedVersions.find((entry) => entry.id === versionId);
    if (!version) {
      return;
    }

    this.applySnapshot(version.snapshot);
    this.activeVersionId = version.id;
    this.lastSavedAt = version.savedAt;
    this.syncView();
  }

  private extractGridItemIdFromEvent(event: Event): string | null {
    const path = event.composedPath();

    for (const node of path) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      const itemId = node.getAttribute('luzmo-grid-item-id') ?? node.getAttribute('gs-id');

      if (itemId) {
        return itemId;
      }
    }

    return null;
  }

  private getGridItemIdAtPointer(event: MouseEvent): string | null {
    const gridHost = this.gridHostRef?.nativeElement;
    const shadowRoot = (gridHost as HTMLElement & { shadowRoot?: ShadowRoot | null } | undefined)?.shadowRoot;

    if (!gridHost || !shadowRoot?.elementFromPoint) {
      return null;
    }

    const gridRect = gridHost.getBoundingClientRect();

    if (
      event.clientX < gridRect.left ||
      event.clientX > gridRect.right ||
      event.clientY < gridRect.top ||
      event.clientY > gridRect.bottom
    ) {
      return null;
    }

    const target = shadowRoot.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;

    if (!target) {
      return null;
    }

    const item = target.closest('.luzmo-grid-item') as HTMLElement | null;

    return item?.getAttribute('luzmo-grid-item-id') ?? null;
  }

  private createDefaultItemsModel(): GridItemData[] {
    return structuredClone(
      this.initialItemTemplates.filter((item) => item.id && this.starterReportModuleIds.has(item.id))
    );
  }

  private createModuleFromTemplate(moduleId: string): GridItemData | null {
    const template = this.initialItemTemplatesById.get(moduleId);

    if (!template) {
      return null;
    }

    return structuredClone(template);
  }

  private createPositionForNewModule(item: GridItemData): NonNullable<GridItemData['position']> {
    const base = item.position;
    const maxBottom = this.itemsModel.reduce((currentMax, currentItem) => {
      if (!currentItem.position) {
        return currentMax;
      }

      return Math.max(currentMax, currentItem.position.row + currentItem.position.sizeY);
    }, 0);

    return {
      sizeX: base?.sizeX ?? 24,
      sizeY: base?.sizeY ?? 16,
      row: maxBottom,
      col: 0,
      ...(typeof base?.minSizeX === 'number' ? { minSizeX: base.minSizeX } : {}),
      ...(typeof base?.minSizeY === 'number' ? { minSizeY: base.minSizeY } : {}),
      ...(typeof base?.maxSizeX === 'number' ? { maxSizeX: base.maxSizeX } : {}),
      ...(typeof base?.maxSizeY === 'number' ? { maxSizeY: base.maxSizeY } : {})
    };
  }

  private createSnapshot(): DashboardSnapshot {
    return {
      itemsModel: structuredClone(this.itemsModel),
      selectedItemId: this.selectedItemId,
      builderTab: this.builderTab,
      globalFilters: structuredClone(this.globalFilters),
      authoringMode: this.authoringMode
    };
  }

  private applySnapshot(snapshot: DashboardSnapshot): void {
    this.itemsModel = structuredClone(snapshot.itemsModel);
    this.selectedItemId = snapshot.selectedItemId;
    this.builderTab = snapshot.builderTab === 'options' ? 'options' : 'data';
    this.globalFilters = normalizeGlobalFilters(snapshot.globalFilters, this.scenarioOptions);
    this.authoringMode = snapshot.authoringMode === 'advanced' ? 'advanced' : 'guided';
    if (this.selectedItemId && !this.itemsModel.some((item) => item.id === this.selectedItemId)) {
      this.selectedItemId = this.itemsModel[0]?.id ?? null;
    }

    this.refreshDerivedState();
    this.syncGridSelectionHighlight();
    this.syncView();
  }

  private afterStateMutation(): void {
    this.refreshDerivedState();
    this.activeVersionId = 'live';
    this.syncGridSelectionHighlight();
    this.syncView();
  }

  /**
   * Layout-only mutations (drag/resize) skip the full derived-state rebuild
   * to avoid re-rendering every viz on each pointer move.
   */
  private afterLayoutMutation(): void {
    this.activeVersionId = 'live';
    this.syncView();
  }

  private refreshDerivedState(): void {
    this.normalizeLegacyChartTypes();
    this.applyPositionGuards();
    this.applyLegacyNumericLabelBackfill();
    this.refreshModuleMembershipState();
    this.compactHeroKpiTiles();
    this.syncGridItems();
    this.narrative = buildNarrative(this.globalFilters);
  }

  private normalizeLegacyChartTypes(): void {
    const supportedTypes = new Set<string>(SUPPORTED_VIZ_TYPES as readonly string[]);
    const { items, changed } = normalizeLegacyGridVizTypes(this.itemsModel, supportedTypes);
    if (changed) {
      this.itemsModel = items;
    }
  }

  private applyPositionGuards(): void {
    const { items, changed } = enforceGridPositionGuards(this.itemsModel, this.minSizeByVizType);
    if (changed) {
      this.itemsModel = items;
    }
  }

  private applyLegacyNumericLabelBackfill(): void {
    const { items, changed } = backfillLegacyNumericLabels(this.itemsModel);
    if (changed) {
      this.itemsModel = items;
    }
  }

  private refreshModuleMembershipState(): void {
    const nextIds = new Set<string>();

    for (const item of this.itemsModel) {
      if (item.id) {
        nextIds.add(item.id);
      }
    }

    this.moduleIdsInReport = nextIds;
  }

  private syncGridItems(): void {
    // Every renderable grid item receives a fully materialized options payload:
    // - active app theme
    // - loader colors
    // - global filters translated to ACK viz filter format
    const globalVizFilters = buildGlobalVizFilters(this.globalFilters);
    const loaderTheme = this.themeMode === 'dark'
      ? {
          mode: 'dark',
          background: '#1a1d23',
          fontColor: '#d1d5db',
          spinnerColor: 'rgba(94, 234, 212, 0.9)',
          spinnerBackground: 'rgba(94, 234, 212, 0.15)'
        }
      : {
          mode: 'light',
          background: '#f7f8fa',
          fontColor: '#6b7280',
          spinnerColor: 'rgba(15, 118, 110, 0.8)',
          spinnerBackground: 'rgba(15, 118, 110, 0.12)'
        };

    this.gridItems = this.itemsModel.map((item) => {
      const currentOptions = structuredClone(item.options ?? {}) as Record<string, unknown>;
      const loaderOption = currentOptions['loader'];
      const currentLoader =
        loaderOption && typeof loaderOption === 'object'
          ? (structuredClone(loaderOption) as Record<string, unknown>)
          : {};
      const nextOptions = {
        ...currentOptions,
        theme: structuredClone(this.gridTheme),
        loader: {
          ...currentLoader,
          ...loaderTheme
        }
      };

      return {
        ...structuredClone(item),
        slots: structuredClone(item.slots ?? []),
        options: nextOptions,
        filters: [...globalVizFilters]
      };
    });
  }

  private syncItemsModelFromGridState(): void {
    // ACK owns the live drag/resize positions while interacting.
    // Before persisting a snapshot we reconcile back into `itemsModel`.
    const grid = this.gridHostRef?.nativeElement as
      | (HTMLElement & {
          gridItems?: Array<{
            item?: GridItemData;
          }>;
        })
      | undefined;

    const liveGridItems = grid?.gridItems;

    if (!liveGridItems || liveGridItems.length === 0) {
      return;
    }

    const livePositions = new Map<string, NonNullable<GridItemData['position']>>();

    for (const gridItem of liveGridItems) {
      const item = gridItem.item;
      const itemId = item?.id;
      const position = item?.position;

      if (itemId && position) {
        livePositions.set(itemId, { ...position });
      }
    }

    if (livePositions.size === 0) {
      return;
    }

    let changed = false;

    this.itemsModel = this.itemsModel.map((item) => {
      if (!item.id || !item.position) {
        return item;
      }

      const livePosition = livePositions.get(item.id);

      if (!livePosition) {
        return item;
      }

      const isSamePosition =
        livePosition.col === item.position.col &&
        livePosition.row === item.position.row &&
        livePosition.sizeX === item.position.sizeX &&
        livePosition.sizeY === item.position.sizeY;

      if (isSamePosition) {
        return item;
      }

      changed = true;

      return {
        ...item,
        position: { ...livePosition }
      };
    });

    if (changed) {
      this.syncGridItems();
    }
  }

  private readString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private restoreSnapshotFromStorage(): void {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<PersistedDashboardState> & {
        savedAt?: unknown;
        snapshot?: unknown;
        versions?: unknown;
      };

      this.savedVersions = this.coerceSavedVersions(parsed.versions);

      const snapshot = parsed.snapshot as DashboardSnapshot | undefined;

      if (snapshot) {
        this.applySnapshot(snapshot);
      }

      this.lastSavedAt = typeof parsed.savedAt === 'string' ? parsed.savedAt : null;
      this.activeVersionId = 'live';
      this.syncView();
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private restoreThemeMode(): void {
    const raw = localStorage.getItem(this.themeStorageKey);

    if (raw === 'dark' || raw === 'light') {
      this.themeMode = raw;
      return;
    }

    this.themeMode = 'light';
  }

  private persistThemeMode(): void {
    localStorage.setItem(this.themeStorageKey, this.themeMode);
  }

  private persistStorage(snapshot = this.createSnapshot(), savedAt = this.lastSavedAt): void {
    const payload: PersistedDashboardState = {
      version: 2,
      savedAt: savedAt ?? null,
      snapshot,
      versions: this.savedVersions
    };

    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  private coerceSavedVersions(value: unknown): SavedReportVersion[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const versions: SavedReportVersion[] = [];

    for (const entry of value) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      const candidate = entry as Partial<SavedReportVersion>;
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.label !== 'string' ||
        typeof candidate.savedAt !== 'string' ||
        !candidate.snapshot
      ) {
        continue;
      }

      versions.push({
        id: candidate.id,
        label: candidate.label,
        savedAt: candidate.savedAt,
        snapshot: candidate.snapshot as DashboardSnapshot
      });

      if (versions.length >= this.maxSavedVersions) {
        break;
      }
    }

    return versions;
  }

  private syncView(): void {
    // In NoopNgZone mode we must trigger CD manually.
    // Microtask batching avoids repeated detectChanges storms.
    if (this.viewSyncScheduled) {
      return;
    }

    this.viewSyncScheduled = true;
    queueMicrotask(() => {
      this.viewSyncScheduled = false;
      this.cdr.detectChanges();
    });
  }

  private readControlValue(event: Event): string {
    const target = event.target as { value?: unknown; selected?: unknown } | null;
    const targetValue = this.readString(target?.value) ?? this.readString(target?.selected);
    if (targetValue) {
      return targetValue;
    }

    const customEvent = event as CustomEvent<Record<string, unknown>>;
    if (customEvent.detail && typeof customEvent.detail === 'object') {
      const detailValue = this.readString(customEvent.detail['value']) ?? this.readString(customEvent.detail['selected']);
      if (detailValue) {
        return detailValue;
      }
    }

    return '';
  }

  private compactHeroKpiTiles(): void {
    const { items, changed } = compactKpiTiles(this.itemsModel);
    if (changed) {
      this.itemsModel = items;
    }
  }

  private syncGridSelectionHighlight(): void {
    // Visual selection highlight is applied directly in the grid shadow DOM.
    // We keep it presentation-only to avoid ACK action feedback loops.
    queueMicrotask(() => {
      const gridHost = this.gridHostRef?.nativeElement as HTMLElement | undefined;
      const shadowRoot = (gridHost as HTMLElement & { shadowRoot?: ShadowRoot | null } | undefined)?.shadowRoot;

      if (!shadowRoot) {
        return;
      }

      const tiles = Array.from(shadowRoot.querySelectorAll<HTMLElement>('.luzmo-grid-item'));

      for (const tile of tiles) {
        const tileId = tile.getAttribute('luzmo-grid-item-id');
        const isSelected = Boolean(!this.isFixedView && this.selectedItemId && tileId === this.selectedItemId);

        tile.style.transition = 'box-shadow 150ms ease, border-color 150ms ease';
        tile.style.boxShadow = isSelected ? '0 0 0 2px rgba(15, 118, 110, 0.35)' : '';
        tile.style.borderColor = isSelected ? 'rgba(15, 118, 110, 0.5)' : '';
        tile.style.zIndex = isSelected ? '3' : '';
      }
    });
  }

  private setupResizeGuard(): void {
    if (this.resizeGuardBound) {
      return;
    }

    const gridHost = this.gridHostRef?.nativeElement;
    if (!gridHost) {
      return;
    }

    gridHost.addEventListener('pointerdown', this.handleGridPointerDown, { capture: true });
    window.addEventListener('pointerup', this.handleGlobalPointerRelease, { passive: true });
    window.addEventListener('pointercancel', this.handleGlobalPointerRelease, { passive: true });
    this.resizeGuardBound = true;
  }

  private teardownResizeGuard(): void {
    if (!this.resizeGuardBound) {
      return;
    }

    const gridHost = this.gridHostRef?.nativeElement;
    if (gridHost) {
      gridHost.removeEventListener('pointerdown', this.handleGridPointerDown, { capture: true });
    }
    window.removeEventListener('pointerup', this.handleGlobalPointerRelease);
    window.removeEventListener('pointercancel', this.handleGlobalPointerRelease);
    this.resizeGuardBound = false;
    this.setActiveResizeTile(null);
  }

  private readonly handleGridPointerDown = (event: Event): void => {
    const path = event.composedPath();
    let resizeHandleDetected = false;
    let tile: HTMLElement | null = null;

    for (const node of path) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      const className = typeof node.className === 'string' ? node.className : '';
      if (!resizeHandleDetected && (className.includes('ui-resizable-handle') || className.includes('resize-handle'))) {
        resizeHandleDetected = true;
      }

      if (!tile && node.classList.contains('luzmo-grid-item')) {
        tile = node;
      }
    }

    if (!resizeHandleDetected || !tile) {
      return;
    }

    this.isGridResizing = true;
    this.pendingResizeItems = null;
    this.setActiveResizeTile(tile);
  };

  private readonly handleGlobalPointerRelease = (): void => {
    if (this.isGridResizing) {
      this.isGridResizing = false;
      if (this.pendingResizeItems && this.pendingResizeItems.length > 0) {
        const pending = this.pendingResizeItems;
        this.pendingResizeItems = null;
        this.applyGridLayoutUpdate(pending);
      }
    }

    this.setActiveResizeTile(null);
  };

  private setActiveResizeTile(tile: HTMLElement | null): void {
    if (this.activeResizeTile === tile) {
      return;
    }

    const previousViz = this.activeResizeTile?.querySelector('luzmo-embed-viz-item') as HTMLElement | null;
    if (previousViz) {
      previousViz.style.visibility = '';
    }

    this.activeResizeTile = tile;

    const currentViz = this.activeResizeTile?.querySelector('luzmo-embed-viz-item') as HTMLElement | null;
    if (currentViz) {
      currentViz.style.visibility = 'hidden';
    }
  }
}
