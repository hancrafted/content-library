import type { Snapshot } from './factory-model.pure.ts';
import type { FactoryRun } from './factory-run.pure.ts';

/** The readouts last read, and the run they were read from. */
export interface HeldReadout {
  readonly run: FactoryRun;
  readonly snap: Snapshot;
}

/**
 * The readouts to draw for `run`. After a use case switch the held ones belong to the old run, whose work centers the
 * new topology may not have, so the new run is read at once; a re-read the effect does later only refreshes it.
 */
export const readoutFor = (held: HeldReadout, run: FactoryRun): Snapshot => (held.run === run ? held.snap : run.read());
