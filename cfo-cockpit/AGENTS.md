# AGENTS.md — CFO Planning Cockpit

> Written for LLM coding agents. Describes the project, architecture rules, and Luzmo ACK integration points.

---

## 1. Project Overview

- **Name:** CFO Planning Cockpit
- **Purpose:** ACK (Analytics Components Kit) showcase for financial planning and scenario analysis.
- **What it does:** Lets a CFO switch between planning scenarios (Base, Stretch, Stress), apply global filters, and compose a board-ready report on an ACK `<luzmo-grid>` canvas. A sidebar builder supports guided module selection and advanced data/style editing via ACK editing components.

---

## Luzmo (embedded analytics)

This showcase is intentionally wired to a public Luzmo dataset and does not pass any auth or embed token.

When implementing Luzmo functionality (core API, Flex SDK, or Luzmo IQ), refer to Luzmo's [AGENTS.md](https://developer.luzmo.com/agents.md) file for official best practices.

When implementing Luzmo ACK functionality, there is currently no documentation on the web. Use the `ack_llms.txt` file in the project root as documentation.

---

## 2. Core Luzmo Concepts

| App Concept | Luzmo Equivalent | Notes |
|---|---|---|
| `GridItemData` | Luzmo grid item | Chart/KPI definition with type, data slots, options, position, and filters. |
| `ReportLibraryModule` | Predefined chart template | Module metadata (id, title, description, type) mapping to a `GridItemData` template. |
| `GlobalFilterState` | ACK filter groups | Scenario, period, region, business unit, legal entity, currency. Translated to `VizItemFilterGroup[]` and applied to every grid item. |
| `DashboardSnapshot` | Persisted state | Full items model, selected item, filters, authoring mode. Saved to `localStorage` with version history. |
| Dashboard grid | `<luzmo-grid>` | ACK grid component: drag, resize, action menus, chart rendering. |
| Data editor | `<luzmo-item-data-drop-panel>` + `<luzmo-draggable-data-fields-panel>` | Slot editing via drag-and-drop. |
| Style editor | `<luzmo-edit-item>` | Chart options editing (colors, labels, legend, display). |

### ACK Components in Use

- `<luzmo-grid>` — dashboard canvas with 48-column layout, drag/resize, per-item action menus (`edit-data`, `edit-options`, `delete`).
- `<luzmo-item-data-drop-panel>` — data slot editor showing drop targets per slot.
- `<luzmo-draggable-data-fields-panel>` — dataset field browser with drag-and-drop source fields.
- `<luzmo-edit-item>` — chart option editor for the selected item.
- `<luzmo-action-group>` + `<luzmo-action-button>` — toggle button group for Data/Style tab switching.

**Rule:** All chart rendering and editing MUST go through ACK / Luzmo components. Never implement custom chart rendering logic.

---

## 3. Architecture Rules

1. **Angular 17 standalone component.** Single `AppComponent`, no routing, no lazy-loaded features.
2. **Web Component interop.** `CUSTOM_ELEMENTS_SCHEMA` enables `<luzmo-*>` elements. All ACK components are used as custom elements, not Angular components.
3. **No heavy UI frameworks.** No Tailwind, Bootstrap, Material. All styles use SCSS with CSS custom properties.
4. **Strict typing.** `strict: true` in tsconfig. No `any` types. Use `unknown` + narrowing.
5. **Immutable state updates.** All model mutations use spread/map/filter. Never mutate `itemsModel` or `globalFilters` in place.
6. **Module separation:**
   - `cfo-types.ts` — all shared interfaces and type aliases.
   - `cfo-config.ts` — dataset IDs, column/formula UUIDs, filter options, grid themes, initial chart templates (`createInitialItems`).
   - `cfo-ui-config.ts` — scenario descriptions, report library modules, grid action menu configs, starter module IDs.
   - `cfo-view-helpers.ts` — pure functions: narrative generation, global filter translation to ACK format, version labels, option label lookups.
   - `cfo-grid-helpers.ts` — pure functions: position normalization, min/max size guards, legacy viz type migration, KPI tile compaction, numeric label backfill.
   - `app.component.ts` — state orchestration, event handlers, persistence, resize guard.
   - `app.component.html` — template with `@for` / `@if` control flow.
   - `app.component.scss` — design tokens and all styles.

### Key integration notes

- **Theme:** The full theme config object (not a UUID) is passed to every grid item via `options.theme`. Light and dark themes are defined in `cfo-config.ts` as `CFO_GRID_THEME` and `CFO_GRID_THEME_DARK`.
- **Filters:** `buildGlobalVizFilters()` converts the `GlobalFilterState` into `VizItemFilterGroup[]` that ACK understands. These are spread into every item's `filters` array in `syncGridItems()`.
- **Grid selection:** Visual highlight is applied directly to shadow DOM elements via `syncGridSelectionHighlight()`. This avoids ACK re-render loops.
- **Resize guard:** A pointer-event guard (`handleGridPointerDown` / `handleGlobalPointerRelease`) hides viz items during resize to prevent layout thrashing, then applies the pending layout update on pointer release.
- **NoopNgZone:** The app uses `provideExperimentalZonelessChangeDetection()`. All state changes trigger `cdr.detectChanges()` via a microtask-batched `syncView()`.

---

## 4. Code Quality Standard

### On every change, verify:

1. **Zero type errors.** Run `npx ng build` (or `npx tsc --noEmit`).
2. **No dead code.** Remove unused imports, variables, functions, CSS rules.
3. **Consistent naming.** `camelCase` variables and functions, `PascalCase` types and interfaces, `UPPER_SNAKE` constants.
4. **No `any` types.** Use `unknown` + type narrowing, or define a proper interface.
5. **Immutable state.** All updates to `itemsModel`, `globalFilters`, `gridItems` use spread/map/filter.
6. **CSS via custom properties.** Use `:host` design tokens. No hard-coded one-off color values in the SCSS. Tokens: `--bg`, `--surface`, `--border`, `--border-hover`, `--text-1/2/3`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-soft`, `--accent-border`, `--danger`, `--danger-soft`, `--radius`, `--radius-sm`, `--shadow`, `--shadow-lg`.
7. **Clean imports.** Use `import type` for type-only imports. Group: Angular core, then config, then types, then UI config, then helpers.
8. **No console output in production paths.** `console.warn` / `console.error` for error reporting only.
9. **Pure helper functions.** `cfo-view-helpers.ts` and `cfo-grid-helpers.ts` must have zero side effects and no DOM access.

---

## 5. Styling / Design

The UI follows a Pigment-inspired design language: clean, neutral, whitespace-generous, data-focused.

- **Typography:** DM Sans (Google Fonts) at 400/500/600/700 weights. No serif fonts.
- **Color system:** CSS custom properties only. Light neutral background (`--bg: #f7f8fa`) + white card surfaces + teal accent (`--accent: #0f766e`). Dark mode inverts to dark gray surfaces with mint accent (`--accent: #5eead4`).
- **Layout:** Three-row grid shell (topbar, toolbar, workspace). Workspace splits into main column (narrative + grid) and builder sidebar. Single-column below 1240px.
- **Cards:** White background, 1px border, 12px radius, subtle shadow. No glassmorphism, no backdrop-filter, no inset shadows.
- **Buttons:** Unified `.btn` system with `.primary`, `.danger`, `.sm` modifiers.
- **Interactions:** 150ms transitions on borders and backgrounds. Selection highlight via 2px accent ring on grid tiles.

---

## 6. Do / Don't

**Do:** Use Luzmo ACK web components for all chart rendering and editing. Keep state immutable and centralized in `AppComponent`. Use CSS custom properties for all colors. Write strict TypeScript. Keep helper functions pure.

**Don't:** Bypass ACK with D3/Chart.js. Add React/Vue/Svelte alongside Angular. Add Tailwind/Bootstrap/CSS-in-JS. Use `any` types. Mutate state in place. Store secrets in source files. Add `console.log` in production code.

---

## 7. Running the Project

```bash
npm install
npm start
```

Angular dev server starts at `http://localhost:3001`.
