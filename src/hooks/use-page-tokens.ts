import { applyEdits, readGlobalTokens, readSlide, type TokenSet } from '@/lib/page-tokens';
import { diffTokens, type Change, type Edits } from '@/lib/token-changes.pure';
import type { Theme } from '@/lib/token-discovery.pure';
import { useEffect, useState } from 'react';
import { useActiveSlide } from './use-url-state';

export const GLOBAL_SCOPE = { kind: 'global' } as const;

export interface PageTokens {
  globals: TokenSet;
  /** Every Slide seen so far, by id: edits to a Slide stay until the page is reloaded. */
  slides: Record<string, TokenSet>;
  currentSlide: string | null;
}

/**
 * The tokens on the page. Global tokens are read once; the active Slide comes
 * from `useActiveSlide()` (FE-001 §2.3) and its own tokens are read when it
 * becomes active. A Slide read before its content mounted is read again.
 */
export function usePageTokens(): PageTokens {
  const [globals, setGlobals] = useState<TokenSet>({ scope: GLOBAL_SCOPE, tokens: [] });
  const [slides, setSlides] = useState<Record<string, TokenSet>>({});
  const currentSlide = useActiveSlide();

  useEffect(() => {
    setGlobals({ scope: GLOBAL_SCOPE, tokens: readGlobalTokens() });
  }, []);

  useEffect(() => {
    if (!currentSlide) return;
    const slide = readSlide(currentSlide);
    if (!slide) return;
    setSlides((known) => (known[currentSlide]?.tokens.length ? known : { ...known, [currentSlide]: slide }));
  }, [currentSlide]);

  return { globals, slides, currentSlide };
}

/**
 * Writes the edits for the active theme onto the page. It runs again when the
 * theme, the edits or the Slides seen change, and when the page's markup
 * changes: a far Slide drops its content and gets it back on return.
 */
export function useLiveEdits({ globals, slides }: PageTokens, edits: Edits, theme: Theme) {
  useEffect(() => {
    const apply = () => {
      for (const set of [globals, ...Object.values(slides)]) applyEdits(set, edits, theme);
    };
    apply();
    // Child-list changes only: applying edits sets attributes, which must not re-trigger this.
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [globals, slides, edits, theme]);
}

/** Every changed token across the global scope and each Slide seen. */
export function changedTokens(tokens: PageTokens, edits: Edits): Change[] {
  return [tokens.globals, ...Object.values(tokens.slides)].flatMap((set) => diffTokens(set.scope, set.tokens, edits));
}
