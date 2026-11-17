import { useMemo } from 'react';
import type { Speech } from './context-parts.types';
import type { Say } from './context-view';

export function useSay({ words, locale, story, renderMode }: Speech): Say {
  return useMemo(
    () => ({ words, locale, story, tech: renderMode === 'technical' }),
    [words, locale, story, renderMode],
  );
}
