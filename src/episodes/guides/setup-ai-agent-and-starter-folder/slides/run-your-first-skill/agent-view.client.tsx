'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { DEFAULT_AGENT, agentOf, type Agent } from './first-skill.pure';

export function AgentView({ views }: { views: Readonly<Record<Agent, ReactNode>> }) {
  const [pick] = usePagePick('agent', DEFAULT_AGENT);
  return views[agentOf(pick)];
}
