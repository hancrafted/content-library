'use client';

import { PagePicksContext, type PagePicks, type PickName } from '@/episodes/hooks/use-page-pick';
import { useMemo, useState, type ReactNode } from 'react';

/**
 * Holds an Episode page's toolbar picks in React state (FE-001 §1, transient: memory only, never the URL or storage),
 * such as a Guide's operating system and AI agent, which its Slides read through `usePagePick`. It lives with the
 * page, so another page starts from its Slides' defaults. Renders no element of its own, so the page grid is untouched.
 */
export function PagePicksProvider({ children }: { children: ReactNode }) {
  const [picks, setPicks] = useState<PagePicks['picks']>({});
  const value = useMemo<PagePicks>(
    () => ({
      picks,
      setPick: (name: PickName, next: string) =>
        setPicks((now) => (now[name] === next ? now : { ...now, [name]: next })),
    }),
    [picks],
  );
  return <PagePicksContext value={value}>{children}</PagePicksContext>;
}
