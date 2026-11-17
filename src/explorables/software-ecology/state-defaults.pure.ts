import { displayOf } from './display-defaults.pure.ts';
import { presetOf, startSpeedOf } from './factory-run.pure.ts';
import type { Bundle, PileStyle, Settings } from './software-ecology.types';
import { startSettings } from './start-settings.pure.ts';

export interface StateDefaults {
  readonly s: Settings;
  readonly speed: number;
  readonly beltMotion: boolean;
  readonly pile: PileStyle;
}

export const defaultsOf = (B: Bundle, id: string): StateDefaults => {
  const p = presetOf(B, id),
    d = displayOf(B, p);
  return { s: startSettings(B, p), speed: startSpeedOf(B, id), beltMotion: d.beltMotion, pile: d.pile };
};
