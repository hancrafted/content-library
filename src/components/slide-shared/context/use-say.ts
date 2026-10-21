import { useMemo } from 'react';
import type { Speech } from './context-parts.types';
import type { Say } from './context-view';

/** A part's `Say`: rebuilt only when its words, story or renderMode change, so memoised items keep their props. */
export function useSay({ words, locale, story, renderMode }: Speech): Say {
  return useMemo(
    () => ({ words, locale, story, tech: renderMode === 'technical' }),
    [words, locale, story, renderMode],
  );
}
