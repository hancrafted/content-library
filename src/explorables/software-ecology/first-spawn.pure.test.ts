import { describe, expect, it } from 'vitest';
import { firstSpawn } from './first-spawn.pure.ts';

/* The first spawn (design-ADR 0024 §3, §5): the one that carries the request on and that `escalate` rides on. */

describe('success cases', () => {
  it('picks the spawn the file lists first, whatever comes after it', () => {
    // ARRANGE
    const carry = { to: 'pm', n: 1 },
      chance = { to: 'ba', p: 0.3 };
    // ACT
    const first = firstSpawn([carry, chance]);
    // ASSERT
    expect(first).toBe(carry);
  });
});

describe('failure cases', () => {
  it('finds none for a work center without spawns', () => {
    // ARRANGE
    const none: { to: string }[] = [];
    // ACT
    const first = firstSpawn(none);
    // ASSERT
    expect(first).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('picks a choice spawn too, when it is listed first', () => {
    // ARRANGE
    const choice = { choose: [{ to: 'eng' }, { to: 'qa' }] };
    // ACT
    const first = firstSpawn<object>([choice, { to: 'ops', n: 1 }]);
    // ASSERT
    expect(first).toBe(choice);
  });
});
