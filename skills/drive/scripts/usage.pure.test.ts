import { describe, expect, it } from 'vitest';
import { DRIVE_USAGE } from './usage.pure.ts';

describe('DRIVE_USAGE', () => {
  it('names every group and the verbs and flags the merged CLI added', () => {
    // ARRANGE
    const named = [
      'worktree',
      'push [--spec <epic>]',
      'pr <watch',
      '[--integration]',
      'ready <number>',
      'learnings',
      'dispatch check',
      'transcript',
      'status <topic>',
      'setup [--check]',
      'guard',
    ];
    // ACT
    const missing = named.filter((part) => !DRIVE_USAGE.includes(part));
    // ASSERT
    expect(missing).toEqual([]);
  });
});
