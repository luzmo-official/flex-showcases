import '@luzmo/embed';
import type { Blueprint, BlueprintGroup, CollectionData } from '../types';
import { generateId } from '../store';
import type { Store } from '../store';
import { luzmoHosts } from '../luzmo/config';
import { fetchAIExampleQuestions, generateAIChart } from '../luzmo/fetch-dashboard';
import type { AIChartSuggestion, ItemSlot } from '../luzmo/types';

// ---------------------------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------------------------

/** Map dashboard-API slot format (column/set) to Flex SDK format (columnId/datasetId). */
function toFlexSlots(slots: ItemSlot[]): Record<string, unknown>[] {
  return slots.map((slot) => ({
    ...slot,
    content: slot.content.map(({ column, set, ...rest }) => ({
      ...rest,
      ...(column != null ? { columnId: column } : {}),
      ...(set != null ? { datasetId: set } : {}),
    })),
  }));
}

/** Inject the theme into a chart options object for Flex viz items. */
function withTheme(
  options: Record<string, unknown>,
  theme: string | Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!theme) return options;
  return { ...options, theme };
}

/**
 * Produce a stable string key from a blueprint's data bindings (dataset, column, aggregation).
 * Slot names are intentionally omitted so charts of different types that use the same
 * underlying data (e.g. bar-chart vs donut-chart) produce identical fingerprints.
 */
function slotFingerprint(slots: unknown[]): string {
  const bindings = (slots as ItemSlot[])
    .flatMap((s) => s.content)
    .map((c) => `${c.set ?? ''}:${c.column ?? ''}:${c.type ?? ''}`)
    .sort();
  return bindings.join('|');
}


const FALLBACK_SUGGESTIONS: AIChartSuggestion[] = [
  { title: 'Project cost by category' },
  { title: 'Safety incidents over time' },
  { title: 'Worker hours by site' },
];

/** Extract the first available dataset ID from blueprint slot content. */
function extractDatasetId(blueprints: Blueprint[]): string | undefined {
  for (const bp of blueprints) {
    for (const slot of bp.slots as ItemSlot[]) {
      for (const item of slot.content) {
        if (item.set) return item.set;
      }
    }
  }
  return undefined;
}

/** Build and append the AI chart generator panel to `parent`. */
function renderAIChartPanel(
  parent: HTMLElement,
  store: Store,
  collectionData: CollectionData,
): void {
  const datasetId = extractDatasetId(collectionData.allBlueprints);

  const panel = document.createElement('div');
  panel.className = 'sidebar__ai-panel';

  // -- Divider ---------------------------------------------------------------
  const divider = document.createElement('div');
  divider.className = 'sidebar__ai-divider';
  panel.appendChild(divider);

  // -- Header ----------------------------------------------------------------
  const panelHeader = document.createElement('div');
  panelHeader.className = 'sidebar__ai-header';
  panelHeader.innerHTML =
    `<span class="sidebar__ai-icon" aria-hidden="true">✦</span>` +
    `<h3 class="sidebar__ai-title">AI Chart</h3>`;
  panel.appendChild(panelHeader);

  // -- Suggestion chips ------------------------------------------------------
  const suggestionsWrap = document.createElement('div');
  suggestionsWrap.className = 'sidebar__ai-suggestions';
  panel.appendChild(suggestionsWrap);

  // -- Textarea --------------------------------------------------------------
  const textarea = document.createElement('textarea');
  textarea.className = 'sidebar__ai-textarea';
  textarea.placeholder = 'Describe the chart you would like to add';
  textarea.rows = 3;
  textarea.setAttribute('aria-label', 'Describe the chart you would like to add');
  if (!datasetId) textarea.disabled = true;
  panel.appendChild(textarea);

  // -- Error message ---------------------------------------------------------
  const errorMsg = document.createElement('p');
  errorMsg.className = 'sidebar__ai-error';
  errorMsg.setAttribute('role', 'alert');
  errorMsg.setAttribute('aria-live', 'polite');
  panel.appendChild(errorMsg);

  // -- Create button ---------------------------------------------------------
  const createBtn = document.createElement('button');
  createBtn.className = 'sidebar__ai-btn';
  createBtn.textContent = 'Create chart';
  createBtn.disabled = true;
  createBtn.setAttribute('aria-label', 'Generate AI chart and add it to the dashboard');
  panel.appendChild(createBtn);

  parent.appendChild(panel);

  // -- Render chips ----------------------------------------------------------
  function renderChips(suggestions: AIChartSuggestion[]): void {
    suggestionsWrap.innerHTML = '';
    for (const s of suggestions) {
      const label = s.title ?? s.question ?? '';
      if (!label) continue;
      const chip = document.createElement('button');
      chip.className = 'sidebar__ai-chip';
      chip.textContent = label;
      chip.setAttribute('aria-label', `Use prompt: ${label}`);
      chip.addEventListener('click', () => {
        textarea.value = label;
        createBtn.disabled = !datasetId;
        errorMsg.textContent = '';
      });
      suggestionsWrap.appendChild(chip);
    }
  }

  // Load example questions from the API, fall back to hardcoded suggestions
  if (datasetId) {
    fetchAIExampleQuestions(datasetId)
      .then((suggestions) => {
        renderChips(suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS);
      })
      .catch(() => {
        renderChips(FALLBACK_SUGGESTIONS);
      });
  } else {
    renderChips(FALLBACK_SUGGESTIONS);
  }

  // -- Enable button when textarea has content -------------------------------
  textarea.addEventListener('input', () => {
    createBtn.disabled = textarea.value.trim().length === 0 || !datasetId;
    errorMsg.textContent = '';
  });

  // -- Generate chart on button click ----------------------------------------
  createBtn.addEventListener('click', () => {
    const question = textarea.value.trim();
    if (!question || !datasetId) return;

    createBtn.disabled = true;
    createBtn.textContent = 'Generating…';
    errorMsg.textContent = '';

    generateAIChart(datasetId, question)
      .then((result) => {
        const blueprint: Blueprint = {
          id: generateId(),
          name: question,
          description: 'AI generated chart',
          type: result.type,
          options: result.options ?? {},
          slots: result.slots ?? [],
          theme: collectionData.templateGridTheme ?? collectionData.templateTheme,
        };

        // Register the blueprint so the dashboard grid can resolve it,
        // and persist it to localStorage so it survives page reloads.
        collectionData.allBlueprints.push(blueprint);
        store.dispatch({ type: 'ADD_AI_BLUEPRINT', payload: { blueprint } });

        const tiles = store.getState().tiles;
        const bottomRow = tiles.reduce((max, t) => {
          if (!t.position) return max;
          return Math.max(max, t.position.row + t.position.sizeY);
        }, 0);

        // Use the AI-suggested size when available, otherwise fall back to a sensible default
        const aiPos = result.position;
        const gridColumns = collectionData.templateGridConfig?.columns ?? 12;
        const sizeX = aiPos
          ? Math.min(aiPos.sizeX, gridColumns)
          : Math.min(6, gridColumns);
        const sizeY = aiPos ? aiPos.sizeY : 4;

        store.dispatch({
          type: 'ADD_TILE',
          payload: {
            blueprint,
            position: { sizeX, sizeY, col: 0, row: bottomRow },
          },
        });

        textarea.value = '';
        createBtn.textContent = 'Create chart';
        createBtn.disabled = true;

        requestAnimationFrame(() => {
          const gridContainer = document.querySelector('.dashboard__grid-container');
          if (gridContainer) {
            gridContainer.scrollTo({ top: gridContainer.scrollHeight, behavior: 'smooth' });
          }
        });
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Chart generation failed. Please try again.';
        errorMsg.textContent = msg;
        createBtn.textContent = 'Create chart';
        createBtn.disabled = false;
      });
  });
}

export function renderSidebar(
  container: HTMLElement,
  store: Store,
  collectionData: CollectionData,
): void {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  // -- Top bar (toggle + title — entire bar is clickable) --------------------
  const topBar = document.createElement('button');
  topBar.className = 'sidebar__top';
  topBar.setAttribute('aria-label', 'Toggle sidebar');

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'sidebar__toggle-icon';
  toggleIcon.innerHTML = '☰';
  topBar.appendChild(toggleIcon);

  const header = document.createElement('div');
  header.className = 'sidebar__header';
  header.innerHTML = `<h2 class="sidebar__title">Blueprint Library</h2>`;
  topBar.appendChild(header);

  topBar.addEventListener('click', () => {
    store.dispatch({ type: 'TOGGLE_SIDEBAR' });
  });

  sidebar.appendChild(topBar);

  // -- Search ---------------------------------------------------------------
  const searchWrap = document.createElement('div');
  searchWrap.className = 'sidebar__search';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search blueprints…';
  searchInput.className = 'sidebar__search-input';
  searchInput.setAttribute('aria-label', 'Search blueprints');
  searchInput.addEventListener('input', () => {
    store.dispatch({ type: 'SET_SEARCH', payload: { query: searchInput.value } });
  });
  searchWrap.appendChild(searchInput);
  sidebar.appendChild(searchWrap);

  // -- Collapsed label (vertical text shown when sidebar is collapsed) ------
  const collapsedLabel = document.createElement('div');
  collapsedLabel.className = 'sidebar__collapsed-label';
  collapsedLabel.setAttribute('aria-hidden', 'true');
  collapsedLabel.textContent = 'Blueprints Inside 🏗';
  sidebar.appendChild(collapsedLabel);

  // -- Scrollable list area -------------------------------------------------
  const listArea = document.createElement('div');
  listArea.className = 'sidebar__list';
  sidebar.appendChild(listArea);

  // -- Hover-preview popup --------------------------------------------------
  const popup = document.createElement('div');
  popup.className = 'sidebar__preview-popup';
  popup.setAttribute('aria-hidden', 'true');

  // Persistent inner structure — never torn down so that the viz item's
  // internal locale-loading Observable is never interrupted mid-flight.
  const popupInfoEl = document.createElement('div');
  popupInfoEl.className = 'sidebar__popup-info';
  popupInfoEl.style.display = 'none';
  const popupDescEl = document.createElement('p');
  popupDescEl.className = 'sidebar__popup-desc';
  popupInfoEl.appendChild(popupDescEl);

  const popupChartWrap = document.createElement('div');
  popupChartWrap.className = 'sidebar__popup-chart';

  // One persistent viz item reused for all previews.
  const previewViz = document.createElement('luzmo-embed-viz-item');
  previewViz.style.cssText = 'width:100%;height:100%;display:block';
  popupChartWrap.appendChild(previewViz);

  // Stable host/language props set once on element definition.
  customElements.whenDefined('luzmo-embed-viz-item').then(() => {
    Object.assign(previewViz, { ...luzmoHosts, language: 'en', contentLanguage: 'en' });
  });

  popup.appendChild(popupInfoEl);
  popup.appendChild(popupChartWrap);
  document.body.appendChild(popup);

  popup.addEventListener('mouseenter', () => {
    if (popupTimeout) clearTimeout(popupTimeout);
  });
  popup.addEventListener('mouseleave', () => {
    if (popupTimeout) clearTimeout(popupTimeout);
    popupTimeout = setTimeout(hidePopup, 200);
  });

  let popupTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Derive a sensible preview height from the chart's original grid footprint.
   * Uses the sizeY/sizeX aspect ratio so wide-short charts get a short preview
   * and squarish/tall charts get a proportionally taller one.
   * `refWidth` is the available preview width (sidebar card ≈ 280 px, popup ≈ 380 px).
   */
  function previewHeightFor(blueprint: Blueprint, refWidth: number, min: number, max: number): number {
    const pos = collectionData.allPositions[blueprint.id];
    if (!pos) return Math.round((min + max) / 2); // midpoint fallback
    const aspect = pos.sizeY / pos.sizeX; // height-to-width ratio in grid cells
    return Math.min(max, Math.max(min, Math.round(refWidth * aspect)));
  }

  function showPopup(blueprint: Blueprint, anchorEl: HTMLElement): void {
    const chartHeight = previewHeightFor(blueprint, 380, 160, 300);
    const popupWidth = 380;
    const offset = 12;

    // Info section: only shown when the blueprint has annotation description text
    const hasDescription = Boolean(blueprint.description);
    const infoHeight = hasDescription ? 56 : 0;
    const popupHeight = chartHeight + infoHeight;

    // Position flush to the right edge of the anchor card
    const rect = anchorEl.getBoundingClientRect();
    let left = rect.right + offset;
    let top = rect.top;
    // Flip left if it overflows the right viewport edge
    if (left + popupWidth > window.innerWidth - 8) left = rect.left - popupWidth - offset;

    if (top + popupHeight > window.innerHeight - 8) top = window.innerHeight - 8 - popupHeight;
    if (top < 8) top = 8;

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.style.width = `${popupWidth}px`;
    popup.style.height = `${popupHeight}px`;

    // -- Annotation description (only when present) --
    if (hasDescription) {
      popupDescEl.textContent = blueprint.description;
      popupInfoEl.style.display = '';
    } else {
      popupInfoEl.style.display = 'none';
    }

    // -- Chart preview: update the persistent viz item in-place --
    popupChartWrap.style.height = `${chartHeight}px`;
    customElements.whenDefined('luzmo-embed-viz-item').then(() => {
      Object.assign(previewViz, {
        type: blueprint.type,
        options: withTheme(blueprint.options ?? {}, blueprint.theme),
        slots: toFlexSlots(blueprint.slots as ItemSlot[]),
        filters: blueprint.filters?.length ? blueprint.filters : [],
        selectedData: blueprint.selectedData ?? null,
      });
    });

    popup.classList.add('sidebar__preview-popup--visible');
    popup.setAttribute('aria-hidden', 'false');
  }

  function hidePopup(): void {
    popup.classList.remove('sidebar__preview-popup--visible');
    popup.setAttribute('aria-hidden', 'true');
  }

  // -- Build a single card element for a blueprint --------------------------
  const cardMap = new Map<string, HTMLLIElement[]>();
  const blueprintById = new Map<string, Blueprint>();

  function buildCard(blueprint: Blueprint): HTMLLIElement {
    blueprintById.set(blueprint.id, blueprint);

    const li = document.createElement('li');
    li.className = 'sidebar__card sidebar__card--compact';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.title = blueprint.name;

    const labelWrap = document.createElement('div');
    labelWrap.className = 'sidebar__card-content';
    const nameEl = document.createElement('span');
    nameEl.className = 'sidebar__card-name';
    nameEl.textContent = blueprint.name;
    labelWrap.appendChild(nameEl);
    li.appendChild(labelWrap);

    // -- Click to add tile ------------------------------------------------
    const addTile = (): void => {
      const originalPos = collectionData.allPositions[blueprint.id];
      // Only retain size from the original dashboard; place at the bottom of the grid
      const tiles = store.getState().tiles;
      const bottomRow = tiles.reduce((max, t) => {
        if (!t.position) return max;
        return Math.max(max, t.position.row + t.position.sizeY);
      }, 0);
      const position = originalPos
        ? { sizeX: originalPos.sizeX, sizeY: originalPos.sizeY, col: 0, row: bottomRow }
        : undefined;
      store.dispatch({ type: 'ADD_TILE', payload: { blueprint, position } });

      // Scroll the grid container to the bottom so the new tile is visible
      requestAnimationFrame(() => {
        const gridContainer = document.querySelector('.dashboard__grid-container');
        if (gridContainer) {
          gridContainer.scrollTo({ top: gridContainer.scrollHeight, behavior: 'smooth' });
        }
      });
    };
    li.addEventListener('click', addTile);
    li.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        addTile();
      }
    });

    // -- Hover to preview larger chart ------------------------------------
    li.addEventListener('mouseenter', () => {
      if (popupTimeout) clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => showPopup(blueprint, li), 300);
    });
    li.addEventListener('mouseleave', () => {
      if (popupTimeout) clearTimeout(popupTimeout);
      popupTimeout = setTimeout(hidePopup, 200);
    });

    const existing = cardMap.get(blueprint.id);
    if (existing) existing.push(li);
    else cardMap.set(blueprint.id, [li]);
    return li;
  }

  // -- Deduplicate template blueprints from sidebar ------------------------
  const templateIds = new Set(collectionData.templateBlueprints.map((b) => b.id));

  const nonTemplateFingerprints = new Set(
    collectionData.groups
      .flatMap((g) => g.blueprints)
      .filter((bp) => !templateIds.has(bp.id))
      .map((bp) => slotFingerprint(bp.slots)),
  );

  const sidebarGroups = collectionData.groups.map((g) => {
    const isTemplateGroup = g.blueprints.some((bp) => templateIds.has(bp.id));
    if (!isTemplateGroup) return g;
    return {
      ...g,
      blueprints: g.blueprints.filter(
        (bp) => !nonTemplateFingerprints.has(slotFingerprint(bp.slots)),
      ),
    };
  }).filter((g) => g.blueprints.length > 0);

  // -- Filters group (synthetic, aggregates all filter-type blueprints) -----
  const filterBlueprints = sidebarGroups
    .flatMap((g) => g.blueprints)
    .filter((bp) => bp.type.toLowerCase().includes('filter') || bp.selectedData !== undefined);

  const filterBlueprintIds = new Set(filterBlueprints.map((bp) => bp.id));

  const groupsToRender: BlueprintGroup[] = filterBlueprints.length > 0
    ? [
        { dashboardName: 'Filters', displayName: 'Filters', blueprints: filterBlueprints },
        ...sidebarGroups.map((g) => {
          const isTemplateGroup = g.blueprints.some((bp) => templateIds.has(bp.id));
          if (!isTemplateGroup) return g;
          return { ...g, blueprints: g.blueprints.filter((bp) => !filterBlueprintIds.has(bp.id)) };
        }).filter((g) => g.blueprints.length > 0),
      ]
    : sidebarGroups;

  // -- Build collapsible groups -------------------------------------------
  const groupElements: { header: HTMLElement; content: HTMLElement; group: BlueprintGroup }[] = [];

  for (const group of groupsToRender) {
    const section = document.createElement('div');
    section.className = 'sidebar__group';

    const groupHeader = document.createElement('button');
    groupHeader.className = 'sidebar__group-header';
    groupHeader.setAttribute('aria-expanded', 'false');
    groupHeader.innerHTML = `
      <span class="sidebar__group-name">${group.displayName}</span>
      <span class="sidebar__group-chevron" aria-hidden="true"></span>
    `;

    const groupContent = document.createElement('ul');
    groupContent.className = 'sidebar__group-content sidebar__group-content--collapsed';

    groupHeader.addEventListener('click', () => {
      const isExpanded = groupHeader.getAttribute('aria-expanded') === 'true';
      groupHeader.setAttribute('aria-expanded', String(!isExpanded));
      groupContent.classList.toggle('sidebar__group-content--collapsed', isExpanded);
    });

    // Sort: blueprints with selectedData (pre-filtered state) first, then alphabetically.
    const sortedBlueprints = [...group.blueprints].sort((a, b) => {
      const aIsFilter = a.selectedData !== undefined ? 0 : 1;
      const bIsFilter = b.selectedData !== undefined ? 0 : 1;
      return aIsFilter - bIsFilter;
    });

    if (sortedBlueprints.length === 0) continue;

    for (const blueprint of sortedBlueprints) {
      groupContent.appendChild(buildCard(blueprint));
    }

    section.appendChild(groupHeader);
    section.appendChild(groupContent);
    listArea.appendChild(section);

    groupElements.push({ header: groupHeader, content: groupContent, group });
  }

  // -- Lightweight filter: show/hide cards without destroying them ----------
  let prevQuery = '';

  function applyFilter(query: string): void {
    if (query === prevQuery) return;
    prevQuery = query;
    const q = query.toLowerCase();

    // Filter individual cards
    cardMap.forEach((cards, id) => {
      const blueprint = blueprintById.get(id)!;
      const match =
        !q ||
        blueprint.name.toLowerCase().includes(q) ||
        blueprint.type.toLowerCase().includes(q) ||
        (blueprint.description && blueprint.description.toLowerCase().includes(q));
      for (const li of cards) li.style.display = match ? '' : 'none';
    });

    // Hide group sections when all their cards are hidden
    for (const { header, content, group } of groupElements) {
      const hasVisible = group.blueprints.some((bp) => {
        const cards = cardMap.get(bp.id);
        return cards?.some((c) => c.style.display !== 'none');
      });
      header.style.display = hasVisible ? '' : 'none';
      content.style.display = hasVisible ? '' : 'none';
    }
  }

  // -- Subscribe to state changes -------------------------------------------
  function onStateChange(): void {
    const state = store.getState();
    sidebar.classList.toggle('sidebar--collapsed', state.sidebarCollapsed);
    applyFilter(state.searchQuery);
  }

  // -- AI Chart Panel (pinned to bottom) -------------------------------------
  renderAIChartPanel(sidebar, store, collectionData);

  store.subscribe(onStateChange);
  onStateChange();

  container.appendChild(sidebar);
}
