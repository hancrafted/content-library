import type { PagePicks } from '@/episodes/lib/page-picks.pure';
import { createContext, useContext, useSyncExternalStore } from 'react';

/** The page's picks store, provided once per Episode page by the container's `PagePicksProvider` (FE-001 §1). */
export const PagePicksContext = createContext<PagePicks | null>(null);

const NEVER_NOTIFIES = () => () => undefined;
const NO_PICK = () => undefined;

/**
 * One page-wide pick, such as a Guide's operating system: its value and the call that sets it for every Slide of the
 * page. Reads `fallback` until the viewer picks, and outside an Episode page, where setting it does nothing. The one
 * way a Slide or a slide-shared part reads a pick, never mirroring it into its own state.
 */
export function usePagePick(name: string, fallback: string): readonly [string, (value: string) => void] {
  const picks = useContext(PagePicksContext);
  const read = () => picks?.get(name, fallback) ?? fallback;
  const value = useSyncExternalStore(picks ? picks.subscribe : NEVER_NOTIFIES, read, read);
  return [value, picks ? (next: string) => picks.set(name, next) : NO_PICK] as const;
}
