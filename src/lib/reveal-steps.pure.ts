/*
 * Progressive disclosure on a Slide (a Spec Option's `motion: local`): the presenter reveals a Scene layer by layer,
 * one step per click or right arrow. Step 1 is the resting frame, its later layers dimmed; the last step is the
 * finished frame, which is also what shows without script, in print and under reduced motion.
 */

/** The keys a presenter's press is read from: the key and its modifiers. */
export interface RevealKey {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
}

/** The step a disclosure opens on: the resting frame, or every step at once under reduced motion. */
export function startRevealStep({ reducedMotion, steps }: { reducedMotion: boolean; steps: number }): number {
  return reducedMotion ? steps : 1;
}

/** The step after `step`; the last step holds, so the finished frame stays. */
export function nextRevealStep(step: number, steps: number): number {
  return Math.min(step + 1, steps);
}

/** Every step up to `step`, space-separated: the value a Scene's CSS matches with `~=`. */
export function revealedSteps(step: number): string {
  return Array.from({ length: step }, (_, at) => at + 1).join(' ');
}

/** Whether a key press advances the disclosure: a bare right arrow; with a modifier it belongs to the browser. */
export function advanceKey(press: RevealKey): boolean {
  return press.key === 'ArrowRight' && !press.altKey && !press.ctrlKey && !press.metaKey && !press.shiftKey;
}
