'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { DEFAULT_AGENT, agentOf, type Agent } from './first-skill.pure';

/** Shows the one view, of a set drawn on the server, that belongs to the page's AI-agent pick. */
export function AgentView({ views }: { views: Readonly<Record<Agent, ReactNode>> }) {
  const [pick] = usePagePick('agent', DEFAULT_AGENT);
  return views[agentOf(pick)];
}
