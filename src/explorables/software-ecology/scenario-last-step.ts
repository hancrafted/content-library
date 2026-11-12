/*
 * A model played headless once per build and shared (feedback 09): a state of the file (`start`) warmed as the page
 * warms it, then each step's dials set and run to its week, with the shipped seed. The Why How What stills and the
 * hero preview read it, so their numbers are the model's own; the eval grill deleted the scenarios they read before,
 * so each now names its steps itself.
 */
import { playSteps, scenarioStart } from './factory-scenario.pure.ts';
import { builtinBundles } from './software-ecology-data';
import type { TourStep } from './software-ecology.types';

/** What to play: the state it starts from, and the steps run after it. */
export interface Play {
  readonly start: string;
  readonly steps: readonly TourStep[];
}

const RUNS = new Map<string, ReturnType<typeof run>>();

function run(useCase: string, play: Play) {
  const B = builtinBundles().find((b) => b.data.id === useCase);
  const preset = B?.data.presets.find((p) => p.id === play.start);
  if (!B || !preset) throw new Error(`The ${useCase} use case has no ${play.start} state.`);
  const f = scenarioStart(B, preset);
  // Draining the steps plays them: each sets its dials and runs to its week.
  Array.from(playSteps(f, B, play.steps));
  return { B, preset, f, week: play.steps.at(-1)?.run ?? 0, last: play.steps.length - 1 };
}

/** The model after the play's last step; the same run every time the same play is asked for. */
export function scenarioLastStep(useCase: string, play: Play) {
  const key = `${useCase}/${JSON.stringify(play)}`;
  const hit = RUNS.get(key);
  if (hit) return hit;
  const made = run(useCase, play);
  RUNS.set(key, made);
  return made;
}
