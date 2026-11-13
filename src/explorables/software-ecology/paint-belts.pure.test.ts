import { describe, expect, it } from 'vitest';
import { GIFT, spriteIdx } from './doc-sprites.ts';
import type { FloorDoc } from './factory-model.pure.ts';
import { docKind, handoffSecs } from './paint-belts.ts';

/*
 * What the belts draw for the feedback 10 documents (design-ADR 0024 §14): a release is a gift box, a bad one with a
 * bug; own work wears a lightbulb.
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

describe('edge cases', () => {
  it('takes a release 1.2 s and any other handoff 0.6 s on screen', () => {
    // ARRANGE
    const release = 1.2;
    const handoff = 0.6;
    // ACT
    const [r, h] = [handoffSecs(true), handoffSecs(false)];
    // ASSERT
    expect([r, h]).toEqual([release, handoff]);
  });
});
