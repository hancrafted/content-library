/** The four steps of the Guide, in order; each is one Section. */
export const STEPS = [1, 2, 3, 4] as const;
export type StepNumber = (typeof STEPS)[number];

/** The boxes a viewer can tick, each belonging to one step. */
export const BOXES = [
  { id: 'terminal-open', step: 1 },
  { id: 'agent-installed', step: 2 },
  { id: 'agent-logged-in', step: 2 },
  { id: 'folder-unzipped', step: 3 },
  { id: 'agent-in-folder', step: 3 },
  { id: 'skill-ran', step: 4 },
] as const satisfies readonly { id: string; step: StepNumber }[];
export type BoxId = (typeof BOXES)[number]['id'];

/** The first Slide of each step's Section: where "Start at step N" lands. */
export const STEP_SLIDE: Readonly<Record<StepNumber, string>> = {
  1: 'open-your-terminal',
  2: 'install-your-ai-agent',
  3: 'download-and-unzip-the-starter-folder',
  4: 'run-your-first-skill',
};

/** The step still to do: the first one with an unticked box, or the last when every box is ticked. */
export function startStep(ticked: ReadonlySet<BoxId>): { step: StepNumber; allDone: boolean } {
  for (const step of STEPS) {
    if (BOXES.some((box) => box.step === step && !ticked.has(box.id))) return { step, allDone: false };
  }
  return { step: 4, allDone: true };
}

/** Whether every box of `step` is ticked. */
export function isStepDone(step: StepNumber, ticked: ReadonlySet<BoxId>): boolean {
  return BOXES.filter((box) => box.step === step).every((box) => ticked.has(box.id));
}
