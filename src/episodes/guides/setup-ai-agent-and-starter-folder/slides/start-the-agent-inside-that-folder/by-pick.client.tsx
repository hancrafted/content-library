'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { agentOf, osOf, type AiAgent, type Os } from './picks.pure';

/**
 * Shows the variant of a part for the page's OS pick. The server renders every variant with its own words and rich
 * text; this leaf only chooses, so the Scene stays a server component and only the pick crosses the boundary.
 */
export function ByOs({ variants }: { variants: Readonly<Record<Os, ReactNode>> }) {
  const [pick] = usePagePick('os', 'mac');
  return variants[osOf(pick)];
}

/** Shows the variant of a part for the page's AI-agent pick, rendered by the server as `ByOs`'s are. */
export function ByAgent({ variants }: { variants: Readonly<Record<AiAgent, ReactNode>> }) {
  const [pick] = usePagePick('agent', 'claude-code');
  return variants[agentOf(pick)];
}
