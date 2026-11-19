import { describe, expect, it } from 'vitest';
import { parsePrArgs, USAGE } from './pr-args.pure.ts';

describe('parsePrArgs', () => {
  it('reads watch with poll interval and the integration flag, and ready', () => {
    // ARRANGE
    // ACT
    const parsed = [
      parsePrArgs(['watch', '5']),
      parsePrArgs(['watch', '5', '--integration', '--poll-milliseconds', '10']),
      parsePrArgs(['ready', '7']),
    ];
    // ASSERT
    expect(parsed).toEqual([
      {
        verb: 'watch',
        number: '5',
        integration: false,
        timing: { pollMilliseconds: 30_000 },
      },
      {
        verb: 'watch',
        number: '5',
        integration: true,
        timing: { pollMilliseconds: 10 },
      },
      { verb: 'ready', number: '7' },
    ]);
  });

  it('rejects malformed input with the usage text, which documents the integration exit codes', () => {
    // ARRANGE
    // ACT
    const bad = [
      parsePrArgs([]),
      parsePrArgs(['watch']),
      parsePrArgs(['ready', '7', '--integration']),
      parsePrArgs(['watch', '5', '--poll-milliseconds']),
    ];
    // ASSERT
    for (const result of bad) expect(result).toEqual({ error: USAGE });
    expect(USAGE).toMatch(/--integration/);
    expect(USAGE).toMatch(/10.*11.*12/s);
  });
});
