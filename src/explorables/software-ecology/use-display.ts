/*
 * How the factory is drawn, from the ⋮ menu: belt motion and the pile-up style are transient (FE-001 §1; the reference
 * build starts with the belts still and the heap), the theme is the site's preference: the client leaf hands in
 * `useTheme()`'s pair, since a shared hook is reached only from a client file (FE-006 §3).
 */
import type { Theme } from '@/shared/lib/prefs.pure';
import { DARK_QUERY, resolveTheme } from '@/shared/lib/theme.pure';
import { useState } from 'react';
import type { PileStyle } from './paint-pile.ts';

export interface Display {
  readonly beltMotion: boolean;
  readonly onBeltMotion: (on: boolean) => void;
  /** False until the stored theme is read after mount. */
  readonly dark: boolean;
  readonly onDark: (on: boolean) => void;
  readonly pile: PileStyle;
  readonly onPile: (p: PileStyle) => void;
}

export function useDisplay([theme, setTheme]: readonly [Theme | null, (t: Theme) => void]): Display {
  const [beltMotion, onBeltMotion] = useState(false);
  const [pile, onPile] = useState<PileStyle>('heap');
  const dark = theme !== null && resolveTheme(theme, window.matchMedia(DARK_QUERY).matches) === 'dark';
  return { beltMotion, onBeltMotion, dark, onDark: (on) => setTheme(on ? 'dark' : 'light'), pile, onPile };
}
