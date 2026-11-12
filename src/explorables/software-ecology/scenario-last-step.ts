/*
 * A scenario's model at its last tour step, run headless once per build and shared (feedback 09): the Why How What
 * stills and the hero preview both read it, so their numbers are the numbers a viewer reaches with Tour. The model is
 * warmed, then each step's dials are set and run to its week, with the shipped seed.
 */
import { playSteps, scenarioStart, stepsOf } from './factory-scenario.pure.ts';
import { builtinBundles } from './software-ecology-data';

const RUNS = new Map<string, ReturnType<typeof run>>();

function run(useCase: string, scenario: string) {
  const B = builtinBundles().find((b) => b.data.id === useCase);
  const preset = B?.data.presets.find((p) => p.id === scenario);
  if (!B || !preset) throw new Error(`The ${useCase} use case has no ${scenario} scenario.`);
  const f = scenarioStart(B, preset),
    steps = stepsOf(preset);
  // Draining the steps plays them: each sets its dials and runs to its week.
  Array.from(playSteps(f, B, steps));
  return { B, preset, f, week: steps.at(-1)?.run ?? 0, last: steps.length - 1 };
}

/** The model at the scenario's last tour step; the same run every time it is asked for. */
export function scenarioLastStep(useCase: string, scenario: string) {
  const key = `${useCase}/${scenario}`;
  const hit = RUNS.get(key);
  if (hit) return hit;
  const made = run(useCase, scenario);
  RUNS.set(key, made);
  return made;
}
