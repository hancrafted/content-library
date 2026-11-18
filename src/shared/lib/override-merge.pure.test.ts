import { describe, expect, it } from 'vitest';
import { mergeOverride } from './override-merge.pure';

describe('success cases', () => {
  it('merges nested objects by key, so an override names only what differs', () => {
    // ARRANGE
    const base = { title: 'Hello', nav: { next: 'Next', back: 'Back' } };
    const override = { nav: { next: 'Weiter' } };
    // ACT
    const merged = mergeOverride(base, override);
    // ASSERT
    expect(merged).toEqual({ title: 'Hello', nav: { next: 'Weiter', back: 'Back' } });
  });

  it('replaces an array whole instead of merging it by index', () => {
    // ARRANGE
    const base = { steps: ['a', 'b', 'c'] };
    const override = { steps: ['x'] };
    // ACT
    const merged = mergeOverride(base, override);
    // ASSERT
    expect(merged.steps).toEqual(['x']);
  });
});

describe('failure cases', () => {
  it('lets a scalar override replace an object base rather than throwing', () => {
    // ARRANGE
    const base = { label: { text: 'Hello' } };
    const override = { label: 'Hallo' };
    // ACT
    const merged = mergeOverride(base, override);
    // ASSERT
    expect(merged).toEqual({ label: 'Hallo' });
  });

  it('leaves both inputs unchanged', () => {
    // ARRANGE
    const base = { nav: { next: 'Next' } };
    const override = { nav: { next: 'Weiter' } };
    // ACT
    mergeOverride(base, override);
    // ASSERT
    expect(base).toEqual({ nav: { next: 'Next' } });
    expect(override).toEqual({ nav: { next: 'Weiter' } });
  });
});

describe('edge cases', () => {
  it('keeps the base where the override is undefined, at any depth', () => {
    // ARRANGE
    const kept = 2;
    const base = { a: 1, nested: { b: kept } };
    const override = { a: undefined, nested: { b: undefined } };
    // ACT
    const merged = mergeOverride(base, override);
    // ASSERT
    expect(merged).toEqual({ a: 1, nested: { b: kept } });
  });

  it('keeps the base when there is no override at all', () => {
    // ARRANGE
    const base = { a: 1 };
    // ACT
    const merged = mergeOverride(base, undefined);
    // ASSERT
    expect(merged).toBe(base);
  });

  it('lets null override a value, since null is a chosen value and undefined is absence', () => {
    // ARRANGE
    const base = { a: 1 };
    // ACT
    const merged = mergeOverride(base, { a: null });
    // ASSERT
    expect(merged).toEqual({ a: null });
  });
});
