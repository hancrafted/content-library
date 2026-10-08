import { describe, expect, it, vi } from 'vitest';
import { APPROACH_ROOT_MARGIN, createZoneStore, isMounted, isPlaying, keptHeight, zoneOf } from './slide-zone.pure';

describe('zone derivation', () => {
  it('lets active win over near, and falls through to far', () => {
    // ARRANGE / ACT / ASSERT
    expect(zoneOf({ isNear: true, isActive: true })).toBe('active');
    expect(zoneOf({ isNear: false, isActive: true })).toBe('active');
    expect(zoneOf({ isNear: true, isActive: false })).toBe('near');
    expect(zoneOf({ isNear: false, isActive: false })).toBe('far');
  });

  it('mounts content outside far only', () => {
    // ARRANGE / ACT / ASSERT
    expect(['far', 'near', 'active'].map((zone) => isMounted(zone as 'far'))).toEqual([false, true, true]);
  });

  it('plays only in active', () => {
    // ARRANGE / ACT / ASSERT
    expect(['far', 'near', 'active'].map((zone) => isPlaying(zone as 'far'))).toEqual([false, false, true]);
  });

  it('approaches one viewport ahead and behind, wider than the reading line', () => {
    // ARRANGE / ACT / ASSERT
    expect(APPROACH_ROOT_MARGIN).toBe('100% 0px 100% 0px');
  });
});

describe('kept height', () => {
  it('holds the measured height only while far', () => {
    // ARRANGE / ACT / ASSERT
    expect([keptHeight('far', 1800), keptHeight('near', 1800), keptHeight('active', 1800)]).toEqual([1800, 0, 0]);
  });
});

describe('zone store', () => {
  it('reports an unobserved Slide as near, so prerendered content survives hydration', () => {
    // ARRANGE
    const store = createZoneStore();
    // ACT / ASSERT
    expect(store.getZone('a')).toBe('near');
  });

  it('turns far when the approach observer says the Slide left, near when it returns', () => {
    // ARRANGE
    const store = createZoneStore();
    // ACT
    store.setNear('a', false);
    const away = store.getZone('a');
    store.setNear('a', true);
    // ASSERT
    expect([away, store.getZone('a')]).toEqual(['far', 'near']);
  });

  it('keeps one active Slide at a time, demoting the previous to near', () => {
    // ARRANGE
    const store = createZoneStore();
    store.setNear('a', true);
    store.setNear('b', true);
    // ACT
    store.setActive('a');
    store.setActive('b');
    // ASSERT
    expect([store.getZone('a'), store.getZone('b')]).toEqual(['near', 'active']);
  });

  it('notifies on a zone change and stays silent when nothing changed', () => {
    // ARRANGE
    const store = createZoneStore();
    const listener = vi.fn();
    store.subscribe(listener);
    // ACT
    store.setNear('a', false);
    store.setNear('a', false);
    store.setActive('b');
    store.setActive('b');
    // ASSERT
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying after unsubscribe', () => {
    // ARRANGE
    const store = createZoneStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    // ACT
    unsubscribe();
    store.setActive('a');
    // ASSERT
    expect(listener).not.toHaveBeenCalled();
  });

  it('starts every store fresh', () => {
    // ARRANGE
    const first = createZoneStore();
    first.setNear('a', false);
    // ACT
    const second = createZoneStore();
    // ASSERT
    expect(second.getZone('a')).toBe('near');
  });
});
