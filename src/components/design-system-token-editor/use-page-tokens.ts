import { useEffect, useState } from 'react';
import { applyEdits, readGlobalTokens, readSlide, type TokenSet } from './page-tokens';
import { diffTokens, type Change, type Edits } from './token-changes.pure';
import type { Theme } from './token-discovery.pure';

const POLL_MS = 500;

export const GLOBAL_SCOPE = { kind: 'global' } as const;

export interface PageTokens {
  globals: TokenSet;
  /** Every Slide seen so far, by id: edits to a Slide stay until the page is reloaded. */
  slides: Record<string, TokenSet>;
  currentSlide: string | null;
}

/**
 * The tokens on the page. Global tokens are read once; the active Slide follows
 * the URL hash, which the page replaces without an event, so it is polled.
 */
export function usePageTokens(): PageTokens {
  const [globals, setGlobals] = useState<TokenSet>({ scope: GLOBAL_SCOPE, tokens: [] });
  const [slides, setSlides] = useState<Record<string, TokenSet>>({});
  const [currentSlide, setCurrentSlide] = useState<string | null>(null);

  useEffect(() => {
    setGlobals({ scope: GLOBAL_SCOPE, tokens: readGlobalTokens() });
  }, []);

  useEffect(() => {
    const tick = () => {
      const slide = readSlide();
      const id = slide?.scope.kind === 'slide' ? slide.scope.id : null;
      setCurrentSlide(id);
      if (slide && id) setSlides((known) => (known[id] ? known : { ...known, [id]: slide }));
    };
    tick();
    const timer = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return { globals, slides, currentSlide };
}

/** Writes the edits for the active theme onto the page, again on every poll: a far Slide drops its content. */
export function useLiveEdits(tokens: PageTokens, edits: Edits, theme: Theme) {
  useEffect(() => {
    const apply = () => {
      for (const set of [tokens.globals, ...Object.values(tokens.slides)]) applyEdits(set, edits, theme);
    };
    apply();
    const timer = window.setInterval(apply, POLL_MS);
    return () => window.clearInterval(timer);
  }, [tokens, edits, theme]);
}

/** Every changed token across the global scope and each Slide seen. */
export function changedTokens(tokens: PageTokens, edits: Edits): Change[] {
  return [tokens.globals, ...Object.values(tokens.slides)].flatMap((set) => diffTokens(set.scope, set.tokens, edits));
}
