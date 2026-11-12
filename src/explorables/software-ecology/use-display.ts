/*
 * How the factory is drawn, from the Settings popover's Display column: belt motion and the pile-up style, both
 * transient (FE-001 §1; the reference build starts with the belts still and the heap). The theme follows the site
 * header's switch (feedback 08), so it is no setting here.
 */
import { useState } from 'react';
import type { PileStyle } from './software-ecology.types';

export interface Display {
  readonly beltMotion: boolean;
  readonly onBeltMotion: (on: boolean) => void;
  readonly pile: PileStyle;
  readonly onPile: (p: PileStyle) => void;
}

export function useDisplay(): Display {
  const [beltMotion, onBeltMotion] = useState(false);
  const [pile, onPile] = useState<PileStyle>('heap');
  return { beltMotion, onBeltMotion, pile, onPile };
}
