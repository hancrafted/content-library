export interface RevealKey {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
}

export function startRevealStep({ reducedMotion, steps }: { reducedMotion: boolean; steps: number }): number {
  return reducedMotion ? steps : 1;
}

export function nextRevealStep(step: number, steps: number): number {
  return Math.min(step + 1, steps);
}

export function revealedSteps(step: number): string {
  return Array.from({ length: step }, (_, at) => at + 1).join(' ');
}

export function advanceKey(press: RevealKey): boolean {
  return press.key === 'ArrowRight' && !press.altKey && !press.ctrlKey && !press.metaKey && !press.shiftKey;
}
