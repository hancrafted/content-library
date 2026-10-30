'use client';

import { PagePicksContext } from '@/episodes/hooks/use-page-pick';
import { createElement, type ReactNode } from 'react';

/** Renders `content` as the page does, with the viewer's toolbar picks set; a Slide test reaches the picks only here. */
export function withPagePicks(content: ReactNode, picks: Record<string, string> = {}): ReactNode {
  return createElement(PagePicksContext.Provider, { value: { picks, setPick: () => undefined } }, content);
}
