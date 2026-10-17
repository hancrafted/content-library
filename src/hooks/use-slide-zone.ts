import { createZoneStore, type SlideEntry, type SlideZone, type ZoneStore } from '@/lib/slide-zone.pure';
import { ENTRANCE_MS } from '@/lib/typewriter.pure';
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

/** The page's zone store, provided once per Episode page by `SlideZones` (FE-009 §5). */
export const ZoneStoreContext = createContext<ZoneStore | null>(null);

/** The id of the Slide a `SlideMount` wraps, provided to its subtree (FE-009 §4). */
export const SlideIdContext = createContext<string | null>(null);

const OUTSIDE_PAGE: ZoneStore = createZoneStore();
const SERVER_ZONE = (): SlideZone => 'near';
const SERVER_ENTRY = (): SlideEntry => 'pending';

/** A Slide's zone in the page's store; a Slide never reported on reads `near`. */
export function useZoneOf(id: string | null): SlideZone {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  return useSyncExternalStore(store.subscribe, () => (id === null ? 'near' : store.getZone(id)), SERVER_ZONE);
}

/**
 * The zone of the Slide this component sits in (FE-009 §6). A looping island
 * plays only when `isPlaying(useSlideZone())`. Outside any Slide it reads
 * `near`, so nothing plays by accident.
 */
export function useSlideZone(): SlideZone {
  return useZoneOf(useContext(SlideIdContext));
}

/** A Slide's entrance as the store holds it; outside any Slide `done`, in the static HTML `pending`. */
function useStoredEntry(store: ZoneStore, id: string | null): SlideEntry {
  return useSyncExternalStore(store.subscribe, () => (id === null ? 'done' : store.getEntry(id)), SERVER_ENTRY);
}

/**
 * A Slide's entrance (FE-012), in the page's zone store: `pending` in the
 * static HTML, `entering` from its first `active`, `done` once the entrance has
 * had its time. The state lives in memory for the page's life, so a Slide that
 * unmounts while far and returns stays `done` and never replays.
 */
export function useEntryOf(id: string | null): SlideEntry {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  const entry = useStoredEntry(store, id);
  useEffect(() => {
    if (entry !== 'entering' || id === null) return;
    const timer = window.setTimeout(() => store.finishEntry(id), ENTRANCE_MS);
    return () => window.clearTimeout(timer);
  }, [entry, id, store]);
  return entry;
}

/**
 * The entrance of the Slide this component sits in (FE-012), read only: the
 * Slide's mount ends it. A Scene's emphasis motion with a purpose keys on it,
 * so it plays from the Slide's first `active`, once.
 */
export function useSlideEntry(): SlideEntry {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  return useStoredEntry(store, useContext(SlideIdContext));
}
