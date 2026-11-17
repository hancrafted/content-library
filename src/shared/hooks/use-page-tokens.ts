import { applyEdits, readGlobalTokens, readSlide, type TokenSet } from '@/shared/lib/page-tokens';
import { diffTokens, type Change, type Edits } from '@/shared/lib/token-changes.pure';
import type { Theme } from '@/shared/lib/token-discovery.pure';
import { useEffect, useState } from 'react';
import { useDevSlide } from './use-dev-slide';

export const GLOBAL_SCOPE = { kind: 'global' } as const;

export interface PageTokens {
  globals: TokenSet;
  slides: Record<string, TokenSet>;
  currentSlide: string | null;
}

// decision: FE-001 §2.3
export function usePageTokens(): PageTokens {
  const [globals, setGlobals] = useState<TokenSet>({ scope: GLOBAL_SCOPE, tokens: [] });
  const [slides, setSlides] = useState<Record<string, TokenSet>>({});
  const reported = useDevSlide();
  const currentSlide = reported?.id ?? null;
  const folder = reported?.folder ?? null;

  useEffect(() => {
    setGlobals({ scope: GLOBAL_SCOPE, tokens: readGlobalTokens() });
  }, []);

  useEffect(() => {
    if (!currentSlide) return;
    const slide = readSlide(currentSlide, folder);
    if (!slide) return;
    setSlides((known) => (known[currentSlide]?.tokens.length ? known : { ...known, [currentSlide]: slide }));
  }, [currentSlide, folder]);

  return { globals, slides, currentSlide };
}

export function useLiveEdits({ globals, slides }: PageTokens, edits: Edits, theme: Theme) {
  useEffect(() => {
    const apply = () => {
      for (const set of [globals, ...Object.values(slides)]) applyEdits(set, edits, theme);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [globals, slides, edits, theme]);
}

export function changedTokens(tokens: PageTokens, edits: Edits): Change[] {
  return [tokens.globals, ...Object.values(tokens.slides)].flatMap((set) => diffTokens(set.scope, set.tokens, edits));
}
