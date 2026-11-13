import { describe, expect, it } from 'vitest';
import type { FloorBelt, FloorDoc, FloorStation } from './factory-model.pure.ts';
import { ScreenTimes } from './paint-belts.ts';
import { glyphAt, OWN_DROP_SECS, rackX, settle, slotY, Stations } from './paint-station.ts';

/*
 * What the station painter does for the feedback 10 documents (design-ADR 0024 §14, §15): an own ticket drops from the
 * station's glyph into its slot in 0.4 s; a release lands at the Customer in 1.2 s, an answer in 0.6 s.
 */
const doc = (o: Partial<FloorDoc> = {}): FloorDoc => ({
  c: 1,
  t0: 0,
  t1: 1,
  ai: 0,
  good: true,
  complaint: false,
  redo: false,
  fromCustomer: false,
  own: false,
  ...o,
});

const fakeStation = (): FloorStation =>
  ({
    node: { def: { x: 400, y: 300 } },
    waiting: 1,
    queue: { n: 1, at: () => ({ c: 1, good: true, ai: 0, redo: false, complaint: false, own: true }) },
  }) as unknown as FloorStation;

describe('success cases', () => {
  it('puts an own ticket at the glyph first, then at its slot once it has dropped', () => {
    // ARRANGE
    const clock = { now: 1000, reduced: false };
    const st = new Stations({} as never, clock, new ScreenTimes());
    const n = fakeStation();
    const d = n.node.def;
    // ACT
    st.hear('own', n);
    const start = { ...st.of(n).q[0] };
    clock.now = 1000 + OWN_DROP_SECS * 1000;
    settle(n, st.of(n), { ease: 0, now: clock.now });
    const end = { ...st.of(n).q[0] };
    // ASSERT
    expect([start.x, start.y]).toEqual(glyphAt(d));
    expect([end.x, end.y]).toEqual([rackX(d), slotY(d, 0)]);
  });
});

describe('failure cases', () => {
  it('leaves the Customer no rack to keep a landed release in', () => {
    // ARRANGE
    const clock = { now: 0, reduced: false };
    const st = new Stations({ belts: {} } as never, clock, new ScreenTimes());
    const belt = { release: true, key: 'k', from: { kind: 'role' } } as unknown as FloorBelt;
    // ACT
    st.hear('arrive', null, { belt, x: doc() });
    clock.now = 2000;
    st.landAll();
    // ASSERT
    expect(st.lands).toEqual([]);
  });
});

describe('edge cases', () => {
  it('drops an own ticket from the glyph to its slot over 0.4 s, and puts it there at once under reduced motion', () => {
    // ARRANGE
    const layout = {} as never;
    const clock = { now: 1000, reduced: false };
    const st = new Stations(layout, clock, new ScreenTimes());
    const n = fakeStation();
    const d = n.node.def;
    // ACT
    st.hear('own', n);
    const start = { ...st.of(n).q[0] };
    clock.now = 1000 + OWN_DROP_SECS * 500;
    settle(n, st.of(n), { ease: 0, now: clock.now });
    const mid = { ...st.of(n).q[0] };
    clock.now = 1000 + OWN_DROP_SECS * 1000;
    settle(n, st.of(n), { ease: 0, now: clock.now });
    const end = { ...st.of(n).q[0] };
    const still = new Stations(layout, { now: 0, reduced: true }, new ScreenTimes());
    still.hear('own', n);
    // ASSERT
    expect([start.x, start.y]).toEqual(glyphAt(d));
    expect(mid.y).toBeGreaterThan(start.y);
    expect(mid.y).toBeLessThan(slotY(d, 0));
    expect([end.x, end.y]).toEqual([rackX(d), slotY(d, 0)]);
    expect(still.of(n).q[0]?.drop).toBeUndefined();
    expect([still.of(n).q[0]?.x, still.of(n).q[0]?.y]).toEqual([rackX(d), slotY(d, 0)]);
  });

  it('takes a release landing at the Customer for 1.2 s and an answer for 0.6 s', () => {
    // ARRANGE
    const clock = { now: 0, reduced: false };
    const st = new Stations({ belts: {} } as never, clock, new ScreenTimes());
    const belt = (release: boolean) => ({ release, key: 'k', from: { kind: 'role' } }) as unknown as FloorBelt;
    // ACT
    st.hear('arrive', null, { belt: belt(true), x: doc() });
    st.hear('arrive', null, { belt: belt(false), x: doc() });
    clock.now = 700;
    st.landAll();
    const after07 = st.lands.map((l) => l.e.release);
    clock.now = 1300;
    st.landAll();
    // ASSERT
    expect(after07).toEqual([true]);
    expect(st.lands).toEqual([]);
  });
});
