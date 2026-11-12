/*
 * How the factory is drawn, from the Settings popover's Display column: belt motion and the pile-up style, both
 * transient (FE-001 §1) and both starting at what the use-case file defines (its `display`, a state's own over it). The theme follows the site
 * header's switch (feedback 08), so it is no setting here.
 */
import { useState } from 'react';
import { displayOf } from './display-defaults.pure.ts';
import { presetOf } from './factory-run.pure.ts';
import type { Bundle, PileStyle } from './software-ecology.types';

export interface Display {
  readonly beltMotion: boolean;
  readonly onBeltMotion: (on: boolean) => void;
  readonly pile: PileStyle;
  readonly onPile: (p: PileStyle) => void;
}

/** Starts at what the use-case file defines for the state the page opens on (feedback 09). */
export function useDisplay(B: Bundle, preset: string): Display {
  const [beltMotion, onBeltMotion] = useState(() => displayOf(B, presetOf(B, preset)).beltMotion);
  const [pile, onPile] = useState<PileStyle>(() => displayOf(B, presetOf(B, preset)).pile);
  return { beltMotion, onBeltMotion, pile, onPile };
}
