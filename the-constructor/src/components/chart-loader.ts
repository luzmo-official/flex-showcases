import type { LuzmoItemGrid } from '@luzmo/analytics-components-kit/item-grid';

// ---------------------------------------------------------------------------
// Chart Loader — construction-themed loading overlay for luzmo-embed-viz-item
// ---------------------------------------------------------------------------
//
// Each chart tile in the dashboard grid shows a brick-by-brick wall animation
// while the Flex SDK renders the chart. When the `rendered` event fires, the
// overlay fades out and the chart fades in simultaneously.
//
// The animation mirrors the project favicon:
//   col 1 (2 bricks)  col 2 (3 bricks)  col 3 (4 bricks, orange cap)
// Bricks appear layer by layer from the bottom — like a wall being built
// course by course — then hold, fade, and the cycle repeats.

/**
 * CSS injected into every DOM tree scope (document head or shadow root) that
 * contains a chart loader overlay. Necessary because shadow DOM boundaries
 * prevent styles.css from reaching elements inside component shadow roots.
 */
const CHART_LOADER_CSS = `
  @keyframes brick-place {
    0%   { transform: translateY(-7px) scale(0.5);  opacity: 0; }
    11%  { transform: translateY(2px)  scale(1.12); opacity: 1; }
    21%  { transform: translateY(0)    scale(1);    opacity: 1; }
    78%  { transform: translateY(0)    scale(1);    opacity: 1; }
    87%  { transform: translateY(0)    scale(1);    opacity: 0; }
    100% { transform: translateY(-7px) scale(0.5);  opacity: 0; }
  }
  .chart-loader {
    position: absolute !important;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: rgba(27, 30, 38, 0.88);
    border-radius: 8px;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.3s ease-out;
  }
  .chart-loader--done { opacity: 0 !important; }
  .chart-loader__stage { display: flex; align-items: flex-end; gap: 5px; }
  .chart-loader__col { display: flex; flex-direction: column-reverse; gap: 3px; }
  .chart-loader__brick {
    width: 14px; height: 10px; border-radius: 2px;
    background-color: #353842;
    animation: brick-place 8s infinite backwards;
  }
  .chart-loader__brick--light  { background-color: #556070; }
  .chart-loader__brick--accent { background-color: #ff6b2b; box-shadow: 0 0 8px rgba(255,107,43,0.5); }
  .chart-loader__label {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280;
  }
`;

/** Roots into which the chart-loader stylesheet has already been injected. */
const styledRoots = new WeakSet<Document | ShadowRoot>();

/** Inject the chart-loader CSS into a document or shadow root, once only. */
function ensureChartLoaderStyles(root: Document | ShadowRoot): void {
  if (styledRoots.has(root)) return;
  styledRoots.add(root);
  const style = document.createElement('style');
  style.textContent = CHART_LOADER_CSS;
  (root instanceof ShadowRoot ? root : root.head).appendChild(style);
}

/**
 * Build the overlay HTML.
 * DOM order = visual bottom (flex-direction: column-reverse).
 *
 * Each brick carries its own animation-delay (in seconds) so bricks appear
 * layer by layer, left-to-right within each row:
 *   Layer 1 (bottom): col1=0.00  col2=0.07  col3=0.14
 *   Layer 2:          col1=0.35  col2=0.42  col3=0.49
 *   Layer 3 (col2+3):            col2=0.65  col3=0.72
 *   Layer 4 (col3):                         col3=0.90  (orange cap)
 */
function createChartLoaderHTML(): string {
  const b = (cls: string, delay: number) =>
    `<div class="chart-loader__brick${cls ? ` ${cls}` : ''}" style="animation-delay:${delay}s"></div>`;
  return `
    <div class="chart-loader__stage">
      <div class="chart-loader__col">
        ${b('', 0.00)}
        ${b('chart-loader__brick--light', 0.35)}
      </div>
      <div class="chart-loader__col">
        ${b('chart-loader__brick--light', 0.07)}
        ${b('', 0.42)}
        ${b('chart-loader__brick--light', 0.65)}
      </div>
      <div class="chart-loader__col">
        ${b('', 0.14)}
        ${b('chart-loader__brick--light', 0.49)}
        ${b('', 0.72)}
        ${b('chart-loader__brick--accent', 0.90)}
      </div>
    </div>
    <span class="chart-loader__label">Loading</span>
  `;
}

/**
 * Attach a construction-themed loading overlay to every luzmo-embed-viz-item
 * found inside `gridEl`, at any shadow-DOM nesting depth.
 *
 * - The overlay is shown immediately when a viz item appears in the DOM.
 * - The viz item is hidden (opacity 0) while loading so the default Luzmo
 *   spinner is suppressed.
 * - When the Flex SDK emits `rendered` on the viz item, the overlay fades out
 *   and the chart fades in simultaneously.
 * - A 20-second hard timeout guarantees overlays are never permanently stuck.
 * - Handles arbitrary shadow-DOM nesting by recursively observing every shadow
 *   root encountered during scanning.
 */
export function attachGridLoadingOverlays(gridEl: LuzmoItemGrid): void {
  const handled = new WeakSet<Element>();
  /** Maps each viz item to its overlay so the composed-event delegate can remove it. */
  const loaderMap = new WeakMap<Element, HTMLDivElement>();
  /** Roots already being observed — prevents duplicate MutationObservers. */
  const observedRoots = new WeakSet<Element | ShadowRoot>();

  // Ensure the brick-place keyframe is available in the main document.
  ensureChartLoaderStyles(document);

  function removeOverlay(loader: HTMLDivElement): void {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 380);
  }

  function attachLoader(vizItem: Element): void {
    if (handled.has(vizItem)) return;
    handled.add(vizItem);

    const parent = vizItem.parentElement;
    if (!parent) return;

    // Inject CSS into the shadow root containing this viz item, if any.
    const nodeRoot = vizItem.getRootNode();
    if (nodeRoot instanceof ShadowRoot) {
      ensureChartLoaderStyles(nodeRoot);
    }

    // Ensure the parent is a positioning context for the absolute overlay.
    if (getComputedStyle(parent).position === 'static') {
      (parent as HTMLElement).style.position = 'relative';
    }

    const loader = document.createElement('div');
    loader.className = 'chart-loader';
    loader.setAttribute('aria-hidden', 'true');
    // Critical layout styles inlined so the overlay is always out of normal
    // flow and invisible to pointer events, even before CSS classes resolve.
    loader.style.cssText = [
      'position:absolute', 'inset:0', 'z-index:10', 'pointer-events:none',
      'display:flex', 'flex-direction:column', 'align-items:center',
      'justify-content:center', 'gap:8px',
      'background-color:rgba(27,30,38,0.88)',
      'border-radius:8px', 'opacity:1', 'transition:opacity 0.35s ease-out',
    ].join(';');
    loader.innerHTML = createChartLoaderHTML();
    parent.appendChild(loader);
    loaderMap.set(vizItem, loader);

    // Hide the viz item so the default Luzmo spinner is not visible alongside
    // our animation. Both fade together when `rendered` fires.
    const vizEl = vizItem as HTMLElement;
    vizEl.style.opacity = '0';
    vizEl.style.transition = 'opacity 0.35s ease-out';

    let done = false;
    function onRendered(): void {
      if (done) return;
      done = true;
      removeOverlay(loader);
      vizEl.style.opacity = '1';
    }

    vizItem.addEventListener('rendered', onRendered, { once: true });
    setTimeout(onRendered, 20_000);
  }

  /** Recursively observe a root; also observes shadow roots of child elements. */
  function observeRoot(root: Element | ShadowRoot): void {
    if (observedRoots.has(root)) return;
    observedRoots.add(root);

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          processElement(node as Element);
        }
      }
    }).observe(root, { childList: true, subtree: true });

    for (const el of root.querySelectorAll('*')) {
      processElement(el, /* initialScan */ true);
    }
  }

  function processElement(el: Element, initialScan = false): void {
    if (el.localName === 'luzmo-embed-viz-item') {
      attachLoader(el);
    } else {
      if (el.shadowRoot) {
        observeRoot(el.shadowRoot);
      }
      if (!initialScan) {
        el.querySelectorAll('luzmo-embed-viz-item').forEach(attachLoader);
      }
    }
  }

  observeRoot(gridEl);
  if (gridEl.shadowRoot) {
    observeRoot(gridEl.shadowRoot);
  }

  // Belt-and-suspenders: catch `rendered` events that bubble/compose up to
  // gridEl (fires when the event is dispatched with composed: true).
  gridEl.addEventListener('rendered', (e: Event) => {
    const path = e.composedPath();
    for (const node of path) {
      if (node instanceof Element && node.localName === 'luzmo-embed-viz-item') {
        const loader = loaderMap.get(node);
        if (loader) removeOverlay(loader);
        break;
      }
    }
  });
}
