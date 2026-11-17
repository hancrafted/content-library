'use client';

import { PagePicksContext } from '@/episodes/hooks/use-page-pick';
import { createElement, type ReactNode } from 'react';

export function withPagePicks(content: ReactNode, picks: Record<string, string> = {}): ReactNode {
  return createElement(PagePicksContext.Provider, { value: { picks, setPick: () => undefined } }, content);
}
