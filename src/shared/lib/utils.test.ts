import { describe, expect, it } from 'vitest';
import { cn } from './utils';

/* `cn` merges class strings, keeping the last of two classes that set the same thing (FE-011 §3 type roles included). */

describe('success cases', () => {
  it('keeps a type role beside a text colour', () => {
    // ARRANGE
    const expected = 'text-caption text-muted-foreground';
    // ACT
    const merged = cn('text-caption', 'text-muted-foreground');
    // ASSERT
    expect(merged).toBe(expected);
  });
});

describe('failure cases', () => {
  it('drops the earlier of two type roles', () => {
    // ARRANGE
    const expected = 'text-body';
    // ACT
    const merged = cn('text-caption', 'text-body');
    // ASSERT
    expect(merged).toBe(expected);
  });
});

describe('edge cases', () => {
  it('drops the earlier of two text colours, as before', () => {
    // ARRANGE
    const expected = 'text-caption text-foreground';
    // ACT
    const merged = cn('text-caption text-muted-foreground', 'text-foreground');
    // ASSERT
    expect(merged).toBe(expected);
  });
});
