export const STEPS = [1, 2, 3, 4] as const;
export type StepNumber = (typeof STEPS)[number];

export const BOXES = [
  { id: 'terminal-open', step: 1 },
  { id: 'agent-installed', step: 2 },
  { id: 'folder-unzipped', step: 3 },
  { id: 'agent-in-folder', step: 3 },
  { id: 'agent-logged-in', step: 3 },
  { id: 'skill-ran', step: 4 },
] as const satisfies readonly { id: string; step: StepNumber }[];
export type BoxId = (typeof BOXES)[number]['id'];

export const STEP_SLIDE: Readonly<Record<StepNumber, string>> = {
  1: 'open-your-terminal',
  2: 'install-your-ai-agent',
  3: 'download-and-unzip-the-starter-folder',
  4: 'run-your-first-skill',
};

export function startStep(ticked: ReadonlySet<BoxId>): { step: StepNumber; allDone: boolean } {
  for (const step of STEPS) {
    if (BOXES.some((box) => box.step === step && !ticked.has(box.id))) return { step, allDone: false };
  }
  return { step: 4, allDone: true };
}

export function isStepDone(step: StepNumber, ticked: ReadonlySet<BoxId>): boolean {
  return BOXES.filter((box) => box.step === step).every((box) => ticked.has(box.id));
}
