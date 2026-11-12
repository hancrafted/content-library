/*
 * What "Reset to default" restores (feedback 09, Q164): for the active state, the settings, speed and display its
 * use-case file defines. Every setting of a state is definable in the file, so the reset reads the file and nothing else.
 */
import { displayOf } from './display-defaults.pure.ts';
import { startSettings } from './factory-dials.pure.ts';
import { presetOf, startSpeedOf } from './factory-run.pure.ts';
import type { Bundle, PileStyle, Settings } from './software-ecology.types';

export interface StateDefaults {
  readonly s: Settings;
  readonly speed: number;
  readonly beltMotion: boolean;
  readonly pile: PileStyle;
}

/** The state `id` as its file defines it: settings, speed, belt motion and pile-up style. */
export const defaultsOf = (B: Bundle, id: string): StateDefaults => {
  const p = presetOf(B, id),
    d = displayOf(B, p);
  return { s: startSettings(B, p), speed: startSpeedOf(B, id), beltMotion: d.beltMotion, pile: d.pile };
};
