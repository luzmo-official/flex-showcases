import './styles.css';
import { createStore } from './store';
import { fetchCollectionData } from './blueprints.adapter';
import { renderSidebar } from './components/sidebar';
import { renderDashboard } from './components/dashboard';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app element not found');

  // Create the central store (rehydrates tiles from localStorage).
  const store = createStore();

  // Fetch all dashboards from the Luzmo collection.
  const collectionData = await fetchCollectionData();

  // Rehydrate persisted AI-generated blueprints so they are available to both
  // the dashboard grid and the edit panel before either component renders.
  for (const bp of store.getState().aiBlueprints) {
    collectionData.allBlueprints.push(bp);
  }

  // Build the root layout container.
  const layout = document.createElement('div');
  layout.className = 'layout';
  app.appendChild(layout);

  // Mount components.
  renderSidebar(layout, store, collectionData);
  renderDashboard(layout, store, collectionData);
}

main().catch((err) => {
  console.error('[The Constructor] Failed to boot:', err);
});
