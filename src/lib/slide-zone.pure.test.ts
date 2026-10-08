import { describe, expect, it, vi } from 'vitest';
import { APPROACH_ROOT_MARGIN, createZoneStore, isMounted, isPlaying, keptHeight, zoneOf } from './slide-zone.pure';

describe('success cases', () => {
  describe('zone derivation', () => {
    it('lets active win over near, and falls through to far', () => {
      // ARRANGE
      const inputs = [
        { isNear: true, isActive: true },
        { isNear: false, isActive: true },
        { isNear: true, isActive: false },
        { isNear: false, isActive: false },
      ];
      // ACT
      const [bothSet, activeOnly, nearOnly, neither] = inputs.map(zoneOf);
      // ASSERT
      expect(bothSet).toBe('active');
      expect(activeOnly).toBe('active');
      expect(nearOnly).toBe('near');
      expect(neither).toBe('far');
    });

    it('mounts content outside far only', () => {
      // ARRANGE
      const zones = ['far', 'near', 'active'] as const;
      // ACT
      const mounted = zones.map((zone) => isMounted(zone));
      // ASSERT
      expect(mounted).toEqual([false, true, true]);
    });

    it('plays only in active', () => {
      // ARRANGE
      const zones = ['far', 'near', 'active'] as const;
      // ACT
      const playing = zones.map((zone) => isPlaying(zone));
      // ASSERT
      expect(playing).toEqual([false, false, true]);
    });

    it('approaches one viewport ahead and behind, wider than the reading line', () => {
      // ARRANGE
      const expected = '100% 0px 100% 0px';
      // ACT
      const margin = APPROACH_ROOT_MARGIN;
      // ASSERT
      expect(margin).toBe(expected);
    });
  });

  describe('kept height', () => {
    it('holds the measured height only while far', () => {
      // ARRANGE
      const measured = 1800;
      // ACT
      const kept = [keptHeight('far', measured), keptHeight('near', measured), keptHeight('active', measured)];
      // ASSERT
      expect(kept).toEqual([1800, 0, 0]);
    });
  });

  describe('zone store', () => {
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
  });
});

describe('failure cases', () => {
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
});

describe('edge cases', () => {
  it('reports an unobserved Slide as near, so prerendered content survives hydration', () => {
    // ARRANGE
    const store = createZoneStore();
    // ACT
    const zone = store.getZone('a');
    // ASSERT
    expect(zone).toBe('near');
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
