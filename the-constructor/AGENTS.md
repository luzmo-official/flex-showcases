# AGENTS.md — The Constructor

> Written for LLM coding agents. Describes the project, architecture rules, and Luzmo ACK integration points.

---

## 1. Project Overview

- **Name:** The Constructor
- **Purpose:** ACK (Analytics Component Kit) hackathon showcase for the construction industry.
- **What it does:** Fetches all dashboards accessible to an embed key/token pair via the `/securable` REST API, groups their charts by source dashboard in a collapsible sidebar, and lets users compose a personal dashboard on an ACK `<luzmo-item-grid>` canvas. Users can edit chart type and toggle the legend via a slide-out panel, and generate charts from natural language via the Luzmo `/aichart` API.

---

## Luzmo (embedded analytics)

When implementing Luzmo functionality (Embed tokens, core API, Flex SDK, or Luzmo IQ), refer to Luzmo's [AGENTS.md](https://developer.luzmo.com/agents.md) file for official best practices and implementation guidelines.
When implementing Luzmo ACK functionality, there is currently no documentation on the web. Use the `ack_llms.txt` file in the project root as documentation.

---

## 2. Core Luzmo Concepts

| App Concept | Luzmo Equivalent | Notes |
|---|---|---|
| `Blueprint` | Luzmo dashboard item | Chart definition with type, data slots, options, description, and optional `filters` / `selectedData`. |
| `BlueprintGroup` | Luzmo dashboard | Blueprints grouped by source dashboard; display names are PascalCased. |
| `CollectionData` | Accessible dashboards | Wraps all token-accessible dashboards: template blueprints, positions, grid config, themes, grouped blueprints, flat list, and `allPositions`. |
| `DashboardTile` | Luzmo grid item | A blueprint instance on the canvas. Supports per-tile overrides (`typeOverride`, `optionsOverride`, `slotsOverride`). |
| Dashboard grid | `<luzmo-item-grid>` | ACK grid component: drag, resize, action menus, chart rendering. |
| Edit panel | Custom slide-out | Uses `<luzmo-item-option>` for legend toggle; chart type via native `<select>`. |

### ACK Components in Use

- `<luzmo-item-grid>` — Dashboard canvas with drag, resize, and per-item action menus (`item-options`, `delete`).
- `<luzmo-item-option>` — Single chart option editor (legend toggle in the edit panel).
- `<luzmo-embed-viz-item>` — Flex SDK component for sidebar card hover previews.

**Rule:** All chart rendering and editing MUST go through ACK / Luzmo components. Never implement custom chart rendering logic.

---

## 3. Architecture Rules

1. **Vanilla TypeScript only.** No React, Angular, Vue, or Svelte.
2. **Web Component friendly.** DOM must accommodate `<luzmo-*>` custom elements.
3. **No heavy UI frameworks.** No Tailwind, Bootstrap, Material UI, etc.
4. **Strict typing.** `strict: true` in tsconfig. No `any` types.
5. **Immutable state updates.** Store uses pure reducer-style updates (spread, filter, concat).
6. **Module separation:**
   - `types.ts` — Shared interfaces and action types.
   - `blueprints.adapter.ts` — Accessible dashboards → `CollectionData` mapping (template detection, blueprint extraction, position normalization, theme resolution, filter extraction).
   - `store.ts` — State management (tiles, AI blueprints, sidebar, search). AI blueprints persisted under `constructor_ai_blueprints` in localStorage.
   - `chart-compatibility.ts` — Chart type compatibility filtering, `SLOTS_CONFIG_MAP`, `APP_TO_ACK_TYPE`, `getAckOptionsOverrides`, `toAckChartType`, `analyzeSlots`, `getCompatibleChartTypes`.
   - `luzmo/config.ts` — Embed credentials (`VITE_LUZMO_EMBED_KEY`, `VITE_LUZMO_EMBED_TOKEN`) from env vars.
   - `luzmo/fetch-dashboard.ts` — REST API calls (`/securable`, `/theme`, `/aichart`).
   - `luzmo/types.ts` — Luzmo API response type definitions.
   - `components/sidebar.ts` — Collapsible grouped panels, blueprint cards, search, hover preview, AI chart panel.
   - `components/dashboard.ts` — Dashboard grid, template pre-rendering, reset/clear, event wiring.
   - `components/edit-panel.ts` — Slide-out panel for chart type and legend editing.
   - `styles.css` — All styling via CSS custom properties. Industrial aesthetic: dark slate (`--color-bg`), safety-orange accent (`--color-accent`), `Barlow Condensed` headings, `Barlow` UI labels, `Inter` body text.

### Key integration notes

- **Theme:** Always pass the full resolved theme config object to ACK grid items and Flex viz items — never a bare UUID. `fetchTheme()` resolves live theme configs. `applyThemeRounding()` in `dashboard.ts` bridges the ACK grid's gap where it doesn't auto-resolve `theme.itemSpecific.rounding/padding` (unlike the Flex SDK).
- **Filters:** `blueprint.filters` (itemFilter groups) is applied to both grid items and sidebar previews. `blueprint.selectedData` (filterFromFilterItem initialization state) is applied to sidebar Flex viz items only (ACK grid has no equivalent).
- **Chart type switching:** `toAckChartType()` maps app item keys to ACK types. `getAckOptionsOverrides()` injects mode options for variants (e.g. `stacked-bar-chart → { mode: 'stacked' }`). `switchItem()` from ACK utils remaps slots. Type changes are stored as per-tile `typeOverride`/`slotsOverride` — blueprints are never mutated. Compatibility is always computed from `bp.type` + `bp.slots` (the original blueprint), never from the current override state.
- **AI charts:** `/aichart` generates blueprints from natural language. Results are registered in `collectionData.allBlueprints`, dispatched as `ADD_AI_BLUEPRINT` (persisted to localStorage), and placed on the grid at the AI-suggested size.

---

## 4. Code Quality Standard

### On every change, verify:

1. **Zero type errors.** Run `npx tsc --noEmit`.
2. **No dead code.** Remove unused imports, variables, functions, CSS rules.
3. **Consistent naming.** `camelCase` vars/functions, `PascalCase` types, `UPPER_SNAKE` constants, BEM CSS (`block__element--modifier`).
4. **No `any` types.** Use `unknown` + narrowing, or define a proper interface.
5. **Immutable state.** All store updates use spread/filter/concat.
6. **CSS via custom properties.** Use `:root` design tokens. No hard-coded one-off values. Tokens: palette (`--color-bg/surface/surface-raised/surface-hover/accent/accent-hover/accent-subtle/accent-glow/accent-border/accent-rgb/text/text-muted/text-dim/border/border-light/danger`), typography (`--font-heading/display/body`), spacing (`--space-xs/sm/md/lg/xl/2xl`), radii (`--radius-sm/md/lg`), shadows (`--shadow-sm/md/lg/card-hover/button-hover`), transitions (`--ease-out/duration-fast/normal/slow`), layout (`--sidebar-width/sidebar-collapsed-width/header-height`). Use `rgba(var(--color-accent-rgb), <opacity>)` for accent at arbitrary opacity.
7. **Animations must not fight.** Use `animation-fill-mode: backwards` for entrance animations (not `forwards` or `both`).
8. **Accessibility.** Every interactive element needs a visible focus state, semantic role, and `aria-label` if purpose isn't obvious.
9. **No console output in production paths.** `console.warn` / `console.error` for error reporting only.
10. **Clean imports.** Use `import type` for type-only imports. External packages first, then local modules, alphabetically within groups.
11. **Concise JSDoc.** Public functions and interfaces get a one-line JSDoc.

---

## 5. Styling / Design Requirements

Commit to a distinctive "industrial / modern construction" aesthetic (not generic dashboard UI):

- **Typography:** Characterful display font for headings + clean body font. Pair fonts intentionally via Google Fonts `<link>` in `index.html`.
- **Color system:** CSS variables only. Dark slate base + one strong accent (safety orange) + restrained neutrals. Keep a dominant palette with sharp accents.
- **Spatial composition:** Clean grid, strong hierarchy, generous spacing. Sidebar feels like a "tool drawer"; main area like a "canvas".
- **Depth & atmosphere:** Subtle texture (faint noise overlay, soft gradient, or thin grid pattern). Modern shadows and borders used sparingly; prefer crisp lines with a few elevated surfaces.
- **Motion:** Page-load reveal with staggered fade/slide for sidebar items and tiles. Hover/focus micro-interactions with consistent timing.
- **Accessibility:** Visible focus states, keyboard-navigable sidebar and buttons, sensible contrast.

---

## 6. Do / Don't

**Do:** Use Luzmo ACK web components · Model data after Luzmo concepts · Keep state transitions immutable and centralized · Use CSS custom properties · Write strict TypeScript · Keep dependencies minimal.

**Don't:** Bypass ACK with D3/Chart.js · Implement custom drag-and-drop or grid layout · Add React/Vue/Angular/Svelte · Add Tailwind/Bootstrap/CSS-in-JS · Use `any` types · Store secrets in source files · Create files outside the module structure without justification.

---

## 7. Running the Project

```bash
npm install
npm run dev
```

Vite dev server starts at `http://localhost:5173`.
