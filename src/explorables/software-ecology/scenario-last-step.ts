/*
 * A state of a use-case file played headless once per build and shared (feedback 09, grill 11 Q215): warmed as the page
 * warms it, then each step of its tour or check set and run to its week, with the shipped seed. The hero preview and
 * the Why · How · What stills read the `still` state, kept off the Scenarios menu, so their numbers are the model's own.
 */
import { playSteps, scenarioStart, stepsOf } from './factory-scenario.pure.ts';
import { builtinBundles } from './software-ecology-data';

const RUNS = new Map<string, ReturnType<typeof run>>();

function run(useCase: string, id: string) {
  const B = builtinBundles().find((b) => b.data.id === useCase);
  const preset = B?.data.presets.find((p) => p.id === id);
  if (!B || !preset) throw new Error(`The ${useCase} use case has no ${id} state.`);
  const f = scenarioStart(B, preset),
    steps = stepsOf(preset);
  // Draining the steps plays them: each sets its dials and runs to its week.
  Array.from(playSteps(f, B, steps));
  return { B, preset, f, week: steps.at(-1)?.run ?? 0, last: steps.length - 1 };
}

/** The model after the state's last step; the same run every time the same state is asked for. */
export function scenarioLastStep(useCase: string, id: string) {
  const key = `${useCase}/${id}`;
  const hit = RUNS.get(key);
  if (hit) return hit;
  const made = run(useCase, id);
  RUNS.set(key, made);
  return made;
}
