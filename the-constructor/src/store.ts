import type { Action, AppState, Blueprint, DashboardTile, Listener } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'constructor_dashboard_tiles';
const AI_BLUEPRINTS_KEY = 'constructor_ai_blueprints';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique tile ID. */
export function generateId(): string {
  return `tile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTilesFromStorage(): DashboardTile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DashboardTile[];
  } catch {
    return [];
  }
}

function persistTiles(tiles: DashboardTile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

function loadAIBlueprintsFromStorage(): Blueprint[] {
  try {
    const raw = localStorage.getItem(AI_BLUEPRINTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Blueprint[];
  } catch {
    return [];
  }
}

function persistAIBlueprints(blueprints: Blueprint[]): void {
  try {
    localStorage.setItem(AI_BLUEPRINTS_KEY, JSON.stringify(blueprints));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reduce(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TILE': {
      const { blueprint, position } = action.payload;
      const tile: DashboardTile = {
        id: generateId(),
        blueprintId: blueprint.id,
        title: blueprint.name,
        createdAt: Date.now(),
        position,
      };
      return { ...state, tiles: [...state.tiles, tile] };
    }

    case 'REMOVE_TILE':
      return {
        ...state,
        tiles: state.tiles.filter((t) => t.id !== action.payload.tileId),
      };

    case 'CLEAR_TILES':
      return { ...state, tiles: [] };

    case 'RESET_DASHBOARD':
      return { ...state, tiles: action.payload.tiles };

    case 'UPDATE_POSITIONS': {
      const { positions } = action.payload;
      return {
        ...state,
        tiles: state.tiles.map((t) =>
          positions[t.id] ? { ...t, position: positions[t.id] } : t,
        ),
      };
    }

    case 'UPDATE_TILE_TYPE': {
      const { tileId, chartType, slotsOverride } = action.payload;
      return {
        ...state,
        tiles: state.tiles.map((t) => {
          if (t.id !== tileId) return t;
          return { ...t, typeOverride: chartType, slotsOverride };
        }),
      };
    }

    case 'UPDATE_TILE_OPTIONS': {
      const { tileId, options } = action.payload;
      return {
        ...state,
        tiles: state.tiles.map((t) =>
          t.id === tileId ? { ...t, optionsOverride: options } : t,
        ),
      };
    }

    case 'ADD_AI_BLUEPRINT':
      return { ...state, aiBlueprints: [...state.aiBlueprints, action.payload.blueprint] };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload.query };
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface Store {
  getState(): AppState;
  dispatch(action: Action): void;
  subscribe(listener: Listener): () => void;
}

export function createStore(): Store {
  let state: AppState = {
    tiles: loadTilesFromStorage(),
    aiBlueprints: loadAIBlueprintsFromStorage(),
    sidebarCollapsed: false,
    searchQuery: '',
  };

  const listeners = new Set<Listener>();

  function getState(): AppState {
    return state;
  }

  function dispatch(action: Action): void {
    state = reduce(state, action);

    // Persist tiles on every mutation that changes them (all except UI-only actions).
    if (action.type !== 'TOGGLE_SIDEBAR' && action.type !== 'SET_SEARCH') {
      persistTiles(state.tiles);
    }

    if (action.type === 'ADD_AI_BLUEPRINT') {
      persistAIBlueprints(state.aiBlueprints);
    }

    listeners.forEach((fn) => fn(state));
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { getState, dispatch, subscribe };
}
