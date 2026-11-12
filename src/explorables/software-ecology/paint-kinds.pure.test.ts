import { describe, expect, it } from 'vitest';
import { GIFT, spriteIdx } from './doc-sprites.ts';
import type { FloorBelt, FloorDoc, FloorStation } from './factory-model.pure.ts';
import { docKind, ScreenTimes } from './paint-belts.ts';
import { glyphAt, OWN_DROP_SECS, rackX, settle, slotY, Stations } from './paint-station.ts';

/*
 * What the painter draws for the feedback 10 documents (design-ADR 0024 §14, §15): a release is a gift box, a bad one
 * with a bug; own work wears a lightbulb; an own ticket drops from the station's glyph into its slot in 0.4 s.
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

describe('success cases', () => {
  it('draws a document on a release belt as a gift box, plain when good and bugged when bad', () => {
    // ARRANGE
    const how = { back: false, gift: true };
    // ACT
    const good = docKind(doc(), how);
    const bad = docKind(doc({ good: false }), how);
    // ASSERT
    expect(good).toBe(spriteIdx({ q: 1, ai: 0, warn: 0, gift: true }));
    expect(bad).toBe(spriteIdx({ q: 0, ai: 0, warn: 0, gift: true }));
    expect(good).toBeGreaterThanOrEqual(GIFT);
    expect(bad).toBeGreaterThanOrEqual(GIFT);
  });
});

describe('failure cases', () => {
  it('keeps an answer a document, and the AI mark on a gift', () => {
    // ARRANGE
    const answer = { back: false, gift: false };
    const release = { back: false, gift: true };
    // ACT
    const a = docKind(doc({ ai: 1 }), answer);
    const r = docKind(doc({ ai: 1 }), release);
    // ASSERT
    expect(a).toBe(spriteIdx({ q: 1, ai: 1, warn: 0 }));
    expect(r).toBe(spriteIdx({ q: 1, ai: 1, warn: 0, gift: true }));
  });

  it('gives own work its own kind on a belt and in the rack', () => {
    // ARRANGE
    const how = { back: false, gift: false };
    // ACT
    const own = docKind(doc({ own: true }), how);
    // ASSERT
    expect(own).not.toBe(docKind(doc(), how));
    expect(own).toBe(spriteIdx({ q: 1, ai: 0, warn: 0, own: true }));
  });
});

const fakeStation = (): FloorStation =>
  ({
    node: { def: { x: 400, y: 300 } },
    waiting: 1,
    queue: { n: 1, at: () => ({ c: 1, good: true, ai: 0, redo: false, complaint: false, own: true }) },
  }) as unknown as FloorStation;

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
