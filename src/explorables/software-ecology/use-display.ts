// decision: FE-001 §1
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

export function useDisplay(B: Bundle, preset: string): Display {
  const [beltMotion, onBeltMotion] = useState(() => displayOf(B, presetOf(B, preset)).beltMotion);
  const [pile, onPile] = useState<PileStyle>(() => displayOf(B, presetOf(B, preset)).pile);
  return { beltMotion, onBeltMotion, pile, onPile };
}
