export type SlideZone = 'far' | 'near' | 'active';

export interface ZoneState {
  readonly isNear: boolean;
  readonly isActive: boolean;
}

export const APPROACH_ROOT_MARGIN = '100% 0px 100% 0px';

export function zoneOf({ isNear, isActive }: ZoneState): SlideZone {
  if (isActive) return 'active';
  return isNear ? 'near' : 'far';
}

export function isMounted(zone: SlideZone): boolean {
  return zone !== 'far';
}

// decision: FE-009 §6
export function isPlaying(zone: SlideZone): boolean {
  return zone === 'active';
}

export function edgeEffectShown(shown: boolean, zone: SlideZone): boolean {
  if (zone === 'active') return true;
  return shown && zone !== 'far';
}

export function keptHeight(zone: SlideZone, measured: number): number {
  return isMounted(zone) ? 0 : measured;
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
export type SlideEntry = 'pending' | 'entering' | 'done';

export interface ZoneStore {
  getZone(id: string): SlideZone;
  isSeen(id: string): boolean;
  subscribe(listener: () => void): () => void;
  setNear(id: string, isNear: boolean): void;
  setActive(id: string | null): void;
  getEntry(id: string): SlideEntry;
  finishEntry(id: string): void;
}

export function entryIn(store: Pick<ZoneStore, 'getEntry'>, id: string | null): SlideEntry {
  return id === null ? 'done' : store.getEntry(id);
}

// decision: FE-009 §4
export function artLoadsIn(store: Pick<ZoneStore, 'getZone' | 'isSeen'>, id: string | null): boolean {
  return id === null || (store.isSeen(id) && isMounted(store.getZone(id)));
}

function createEntries(notify: () => void) {
  const entries = new Map<string, SlideEntry>();
  return {
    get: (id: string): SlideEntry => entries.get(id) ?? 'pending',
    start(id: string) {
      if (!entries.has(id)) entries.set(id, 'entering');
    },
    finish(id: string) {
      if (entries.get(id) !== 'entering') return;
      entries.set(id, 'done');
      notify();
    },
  };
}

export function createZoneStore(): ZoneStore {
  const near = new Map<string, boolean>();
  const listeners = new Set<() => void>();
  const entries = createEntries(() => notify());
  let active: string | null = null;
  const notify = () => listeners.forEach((listener) => listener());
  return {
    getZone: (id) => zoneOf({ isNear: near.get(id) ?? true, isActive: active === id }),
    isSeen: (id) => near.has(id),
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    setNear(id, isNear) {
      const seen = near.has(id);
      const before = zoneOf({ isNear: near.get(id) ?? true, isActive: active === id });
      near.set(id, isNear);
      if (!seen || zoneOf({ isNear, isActive: active === id }) !== before) notify();
    },
    setActive(id) {
      if (active === id) return;
      active = id;
      if (id !== null) entries.start(id);
      notify();
    },
    getEntry: entries.get,
    finishEntry: entries.finish,
  };
}
