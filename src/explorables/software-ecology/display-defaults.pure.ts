import type { Bundle, Display, Preset } from './software-ecology.types';

export const DISPLAY_DEFAULT: Required<Display> = { pile: 'heap', beltMotion: false };

export const displayOf = (B: Bundle, p: Preset): Required<Display> => ({
  ...DISPLAY_DEFAULT,
  ...(B.data.display ?? {}),
  ...(p.display ?? {}),
});
