import {
  artLoadsIn,
  createZoneStore,
  entryIn,
  type SlideEntry,
  type SlideZone,
  type ZoneStore,
} from '@/episodes/lib/slide-zone.pure';
import { ENTRANCE_MILLISECONDS } from '@/episodes/lib/typewriter.pure';
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

// decision: FE-009 §5
export const ZoneStoreContext = createContext<ZoneStore | null>(null);

// decision: FE-009 §4
export const SlideIdContext = createContext<string | null>(null);

const OUTSIDE_PAGE: ZoneStore = createZoneStore();
const SERVER_ZONE = (): SlideZone => 'near';
const SERVER_ENTRY = (): SlideEntry => 'pending';

export function useZoneOf(id: string | null): SlideZone {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  return useSyncExternalStore(store.subscribe, () => (id === null ? 'near' : store.getZone(id)), SERVER_ZONE);
}

// decision: FE-009 §6
export function useSlideZone(): SlideZone {
  return useZoneOf(useContext(SlideIdContext));
}

function useEntryState(id: string | null): { entry: SlideEntry; store: ZoneStore } {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  const entry = useSyncExternalStore(store.subscribe, () => entryIn(store, id), SERVER_ENTRY);
  return { entry, store };
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function useEntryOf(id: string | null): SlideEntry {
  const { entry, store } = useEntryState(id);
  useEffect(() => {
    if (entry !== 'entering' || id === null) return;
    const timer = window.setTimeout(() => store.finishEntry(id), ENTRANCE_MILLISECONDS);
    return () => window.clearTimeout(timer);
  }, [entry, id, store]);
  return entry;
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export function useSlideEntry(): SlideEntry {
  return useEntryState(useContext(SlideIdContext)).entry;
}

// decision: FE-009 §4
export function useArtLoadsOf(id: string | null): boolean {
  const store = useContext(ZoneStoreContext) ?? OUTSIDE_PAGE;
  return useSyncExternalStore(
    store.subscribe,
    () => artLoadsIn(store, id),
    () => false,
  );
}

export function useArtLoads(): boolean {
  return useArtLoadsOf(useContext(SlideIdContext));
}
