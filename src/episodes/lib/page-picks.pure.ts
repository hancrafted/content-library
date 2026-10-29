/*
 * The page picks (FE-001 §1): what the viewer picked in a page-wide toolbar, such as a Guide's operating system and AI
 * agent, so every Slide reading a pick shows the same one. Transient state: it passes the reload test (a reload starts
 * from each Slide's default and one click picks again), so it lives in memory, never in the URL or storage. One store
 * per Episode page, provided by the container; a pick is named by a string the Slides agree on (`os`, `agent`), and
 * its default is the reading Slide's. No React, so it tests without a DOM.
 */

/** The page's one picks store: read a pick, set it, and hear when any pick changes. */
export interface PagePicks {
  /** The pick `name` holds, or `fallback` until the viewer picks. */
  readonly get: (name: string, fallback: string) => string;
  /** Sets a pick for the whole page; a value it already holds tells no one. */
  readonly set: (name: string, value: string) => void;
  /** Calls `listener` after every change; returns the call that stops it. */
  readonly subscribe: (listener: () => void) => () => void;
}

/** A fresh, empty store: one per page, so no page inherits another's picks. */
export function createPagePicks(): PagePicks {
  const picks = new Map<string, string>();
  const listeners = new Set<() => void>();
  return {
    get: (name, fallback) => picks.get(name) ?? fallback,
    set: (name, value) => {
      if (picks.get(name) === value) return;
      picks.set(name, value);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
