import { describe, expect, it } from 'vitest';
import { FactoryRun } from './factory-run.pure.ts';
import { readoutFor } from './readout-for.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const runOf = (id: string) => new FactoryRun({ B: builtinBundle(id), preset: 'ideal', now: true });
const centersOf = (run: FactoryRun) => run.topology.centers.map((n) => n.id);

describe('success cases', () => {
  it('serves the held readouts while they were read from the same run', () => {
    // ARRANGE
    const run = runOf('tire'),
      held = { run, snap: run.read() };
    // ACT
    const snap = readoutFor(held, run);
    // ASSERT
    expect(snap).toBe(held.snap);
  });
});

describe('failure cases', () => {
  it('reads the new run at once on the render after a use case switch, so every center has its readout', () => {
    // ARRANGE
    const [from, to] = [runOf('tire'), runOf('gate')],
      held = { run: from, snap: from.read() };
    // ACT
    const snap = readoutFor(held, to);
    // ASSERT
    for (const id of centersOf(to)) expect(snap.stations[id], id).toBeDefined();
  });
});

describe('edge cases', () => {
  it('reads a restarted run of the same use case afresh, not the held readouts of the run before', () => {
    // ARRANGE
    const [before, after] = [runOf('tire'), runOf('tire')],
      held = { run: before, snap: before.read() };
    // ACT
    const snap = readoutFor(held, after);
    // ASSERT
    expect(snap).not.toBe(held.snap);
  });
});
