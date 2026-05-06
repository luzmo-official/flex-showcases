"use client"

import { useCallback, useRef } from "react"

const SCROLLBAR_CSS = `
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(128,128,128,0.45);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.7); }
  * { scrollbar-width: thin; scrollbar-color: rgba(128,128,128,0.45) transparent; }
`

/**
 * Returns a callback ref that fixes mouse-wheel scrolling and scrollbar
 * visibility for Luzmo ACK web components whose scrollable area lives
 * inside a Shadow DOM.
 *
 * Uses a callback ref instead of useRef+useEffect to eliminate timing
 * issues — the setup runs synchronously when React attaches the node,
 * so there's no window where the effect could miss the element.
 */
export function useScrollFixRef() {
  const cleanupRef = useRef<(() => void) | null>(null)

  const callbackRef = useCallback((el: HTMLElement | null) => {
    // Tear down previous instance (e.g. element was replaced by step change)
    cleanupRef.current?.()
    cleanupRef.current = null

    if (!el) return

    const cleanups: (() => void)[] = []
    let observer: MutationObserver | null = null
    let pollInterval: ReturnType<typeof setInterval> | null = null
    let pollTimeout: ReturnType<typeof setTimeout> | null = null

    const injectStyles = (root: ShadowRoot) => {
      if (root.querySelector("[data-scroll-fix]")) return
      const style = document.createElement("style")
      style.setAttribute("data-scroll-fix", "1")
      style.textContent = SCROLLBAR_CSS
      root.appendChild(style)
    }

    const findScrollable = (): Element | null => {
      const root = el.shadowRoot
      if (!root) return null
      for (const node of root.querySelectorAll("*")) {
        if (node.scrollHeight > node.clientHeight + 1) {
          const ov = getComputedStyle(node).overflowY
          if (ov === "auto" || ov === "scroll") return node
        }
      }
      return null
    }

    const wheelHandler = (e: WheelEvent) => {
      const scrollable = findScrollable()
      if (!scrollable) return

      const atTop = scrollable.scrollTop <= 0 && e.deltaY < 0
      const atBottom =
        scrollable.scrollTop + scrollable.clientHeight >=
          scrollable.scrollHeight - 1 && e.deltaY > 0

      if (atTop || atBottom) return

      scrollable.scrollTop += e.deltaY
      e.preventDefault()
      e.stopPropagation()
    }

    // Host-level listener as fallback
    el.addEventListener("wheel", wheelHandler, { passive: false })
    cleanups.push(() => el.removeEventListener("wheel", wheelHandler))

    const setupShadow = (root: ShadowRoot) => {
      injectStyles(root)
      // Capture phase: intercepts before internal handlers can stopPropagation
      root.addEventListener("wheel", wheelHandler, {
        passive: false,
        capture: true,
      })
      cleanups.push(() =>
        root.removeEventListener("wheel", wheelHandler, { capture: true }),
      )
      observer = new MutationObserver(() => injectStyles(root))
      observer.observe(root, { childList: true, subtree: true })
    }

    const root = el.shadowRoot
    if (root) {
      setupShadow(root)
    } else {
      pollInterval = setInterval(() => {
        const r = el.shadowRoot
        if (r) {
          if (pollInterval) clearInterval(pollInterval)
          pollInterval = null
          setupShadow(r)
        }
      }, 100)
      pollTimeout = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval)
        pollInterval = null
      }, 10_000)
    }

    cleanupRef.current = () => {
      cleanups.forEach((fn) => fn())
      observer?.disconnect()
      if (pollInterval) clearInterval(pollInterval)
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [])

  return callbackRef
}
