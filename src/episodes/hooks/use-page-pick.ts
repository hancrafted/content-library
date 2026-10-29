import { createContext, useContext } from 'react';

/** The page-wide toolbar picks a Guide's Slides share: its operating system and its AI agent. */
export type PickName = 'os' | 'agent';

/** What the page's provider hands its Slides: the picks so far, and the call that sets one for the whole page. */
export interface PagePicks {
  readonly picks: Readonly<Partial<Record<PickName, string>>>;
  readonly setPick: (name: PickName, value: string) => void;
}

/** The page's picks, provided once per Episode page by the container's `PagePicksProvider` (FE-001 §1, transient). */
export const PagePicksContext = createContext<PagePicks | null>(null);

const NO_PICK = () => undefined;

/**
 * One page-wide pick, such as a Guide's operating system: its value and the call that sets it for every Slide of the
 * page. Reads `fallback` until the viewer picks, and outside an Episode page, where setting it does nothing. The one
 * way a Slide or a slide-shared part reads a pick, never mirroring it into its own state.
 */
export function usePagePick(name: PickName, fallback: string): readonly [string, (value: string) => void] {
  const page = useContext(PagePicksContext);
  const value = page?.picks[name] ?? fallback;
  return [value, page ? (next: string) => page.setPick(name, next) : NO_PICK] as const;
}
