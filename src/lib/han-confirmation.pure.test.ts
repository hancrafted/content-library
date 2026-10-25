import { describe, expect, it } from 'vitest';
import { confirmedByHan } from './han-confirmation.pure';

const WRITTEN = { at: '2026-10-19T18:00:00Z' };

describe('success cases', () => {
  it('confirms a file Han verified after it was written, one entry or among a list', () => {
    // ARRANGE
    const single = { generated: WRITTEN, verified: { by: 'human:han', at: '2026-10-20T09:00:00Z' } };
    const listed = {
      generated: WRITTEN,
      verified: [
        { by: 'claude-code/opus-5.5', at: '2026-10-20T08:00:00Z' },
        { by: 'human:han', at: '2026-10-19T18:00:00Z' },
      ],
    };

    // ACT
    const confirmed = [confirmedByHan(single), confirmedByHan(listed)];

    // ASSERT
    expect(confirmed).toEqual([true, true]);
  });
});

describe('failure cases', () => {
  it('leaves a file unconfirmed when only an agent verified it, or nobody did', () => {
    // ARRANGE
    const agent = { generated: WRITTEN, verified: { by: 'claude-code/opus-5.5', at: '2026-10-20T09:00:00Z' } };
    const nobody = { generated: WRITTEN };

    // ACT
    const confirmed = [confirmedByHan(agent), confirmedByHan(nobody)];

    // ASSERT
    expect(confirmed).toEqual([false, false]);
  });
});

describe('edge cases', () => {
  it('turns a confirmation back into a proposal when a re-run moves generated.at past it', () => {
    // ARRANGE
    const rerun = {
      generated: { at: '2026-11-01T00:00:00Z' },
      verified: { by: 'human:han', at: '2026-10-20T09:00:00Z' },
    };

    // ACT
    const confirmed = confirmedByHan(rerun);

    // ASSERT
    expect(confirmed).toBe(false);
  });
});
