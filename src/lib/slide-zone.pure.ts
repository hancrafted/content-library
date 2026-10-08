/*
 * Zones (FE-009): where a Slide sits relative to the reader, as three values.
 * `far` is unmounted (the wrapper keeps its height), `near` is mounted and
 * paused, `active` is mounted and playing. The reading line
 * (`reading-line.pure.ts`) decides `active`; the wider approach margin below
 * decides `near`. No DOM, no React.
 */

export type SlideZone = 'far' | 'near' | 'active';

export interface ZoneState {
  readonly isNear: boolean;
  readonly isActive: boolean;
}

/** `rootMargin` growing the viewport one screen above and below, so content is ready before it arrives. */
export const APPROACH_ROOT_MARGIN = '100% 0px 100% 0px';

/** Active wins, then near; anything else is far. */
export function zoneOf({ isNear, isActive }: ZoneState): SlideZone {
  if (isActive) return 'active';
  return isNear ? 'near' : 'far';
}

/** Content stays in the DOM outside `far`. */
export function isMounted(zone: SlideZone): boolean {
  return zone !== 'far';
}

/** Looping animation plays in `active` only (FE-009 §6). */
export function isPlaying(zone: SlideZone): boolean {
  return zone === 'active';
}

/** The height a wrapper's mount keeps while `far`, so unmounting never changes the scroll height; 0 means no hold. */
export function keptHeight(zone: SlideZone, measured: number): number {
  return isMounted(zone) ? 0 : measured;
}

export interface ZoneStore {
  getZone(id: string): SlideZone;
  subscribe(listener: () => void): () => void;
  setNear(id: string, isNear: boolean): void;
  setActive(id: string | null): void;
}

/**
 * One Episode page's zones. A Slide the observer has not reported yet is
 * `near`, so the prerendered HTML survives hydration and the first observer
 * callback only ever removes content.
 */
export function createZoneStore(): ZoneStore {
  const near = new Map<string, boolean>();
  const listeners = new Set<() => void>();
  let active: string | null = null;
  const notify = () => listeners.forEach((listener) => listener());
  return {
    getZone: (id) => zoneOf({ isNear: near.get(id) ?? true, isActive: active === id }),
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    setNear(id, isNear) {
      const before = zoneOf({ isNear: near.get(id) ?? true, isActive: active === id });
      near.set(id, isNear);
      if (zoneOf({ isNear, isActive: active === id }) !== before) notify();
    },
    setActive(id) {
      if (active === id) return;
      active = id;
      notify();
    },
  };
}
