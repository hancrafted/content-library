import { stepsOf } from './factory-beats.pure.ts';
import { playSteps, scenarioStart } from './factory-scenario.pure.ts';
import { builtinBundles } from './software-ecology-data';

const RUNS = new Map<string, ReturnType<typeof run>>();

function run(useCase: string, id: string) {
  const B = builtinBundles().find((b) => b.data.id === useCase);
  const preset = B?.data.presets.find((p) => p.id === id);
  if (!B || !preset) throw new Error(`The ${useCase} use case has no ${id} state.`);
  const f = scenarioStart(B, preset),
    steps = stepsOf(preset);
  Array.from(playSteps(f, B, steps));
  return { B, preset, f, week: steps.at(-1)?.run ?? 0, last: steps.length - 1 };
}

export function scenarioLastStep(useCase: string, id: string) {
  const key = `${useCase}/${id}`;
  const hit = RUNS.get(key);
  if (hit) return hit;
  const made = run(useCase, id);
  RUNS.set(key, made);
  return made;
}
