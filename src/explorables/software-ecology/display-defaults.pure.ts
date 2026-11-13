/*
 * The display a state starts with (feedback 09, Q164): the pile-up style and belt motion, from the page's defaults,
 * the use-case file's `display` and the state's own. "Reset to default" and the first load read the same function.
 */
import type { Bundle, Display, Preset } from './software-ecology.types';

/** The pile-up style and belt motion every state starts at unless the file says otherwise. */
export const DISPLAY_DEFAULT: Required<Display> = { pile: 'heap', beltMotion: false };

/** The display a state defines: the page's defaults, the file's `display`, then the state's own. */
export const displayOf = (B: Bundle, p: Preset): Required<Display> => ({
  ...DISPLAY_DEFAULT,
  ...(B.data.display ?? {}),
  ...(p.display ?? {}),
});
