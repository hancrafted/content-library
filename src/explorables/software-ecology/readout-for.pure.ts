import type { Snapshot } from './factory-model.pure.ts';
import type { FactoryRun } from './factory-run.pure.ts';

export interface HeldReadout {
  readonly run: FactoryRun;
  readonly snap: Snapshot;
}

export const readoutFor = (held: HeldReadout, run: FactoryRun): Snapshot => (held.run === run ? held.snap : run.read());
