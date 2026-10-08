import { createZoneStore, type SlideZone, type ZoneStore } from '@/lib/slide-zone.pure';
import { createContext, useContext, useSyncExternalStore } from 'react';

/** The page's zone store, provided once per Episode page by `SlideZones` (FE-009 §5). */
export const ZoneStoreContext = createContext<ZoneStore | null>(null);

/** The id of the Slide a `SlideMount` wraps, provided to its subtree (FE-009 §4). */
export const SlideIdContext = createContext<string | null>(null);

const OUTSIDE_PAGE: ZoneStore = createZoneStore();
const SERVER_ZONE = (): SlideZone => 'near';

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
