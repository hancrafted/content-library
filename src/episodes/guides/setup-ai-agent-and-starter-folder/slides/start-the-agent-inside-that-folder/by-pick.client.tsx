'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { agentOf, osOf, type AiAgent, type Os } from './picks.pure';

export function ByOs({ variants }: { variants: Readonly<Record<Os, ReactNode>> }) {
  const [pick] = usePagePick('os', 'mac');
  return variants[osOf(pick)];
}

export function ByAgent({ variants }: { variants: Readonly<Record<AiAgent, ReactNode>> }) {
  const [pick] = usePagePick('agent', 'claude-code');
  return variants[agentOf(pick)];
}
