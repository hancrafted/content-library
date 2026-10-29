'use client';

import { PagePicksContext } from '@/episodes/hooks/use-page-pick';
import { createPagePicks } from '@/episodes/lib/page-picks.pure';
import { useState, type ReactNode } from 'react';

/**
 * Provides one picks store to an Episode page (FE-001 §1, transient): the page-wide toolbar picks, such as a Guide's
 * operating system and AI agent, that its Slides read through `usePagePick`. It lives with the page, so another page
 * starts from its Slides' defaults. Renders no element of its own, so the page grid is untouched.
 */
export function PagePicksProvider({ children }: { children: ReactNode }) {
  const [picks] = useState(createPagePicks);
  return <PagePicksContext value={picks}>{children}</PagePicksContext>;
}
