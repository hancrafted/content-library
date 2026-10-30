'use client';

import { usePagePick, type PickName } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';

/**
 * Shows the one case the page's pick names (FE-001 §1, transient), each case drawn on the server, so a Slide's
 * words and links stay server-rendered and only the choice runs in the browser. Before the viewer picks, and in the
 * static HTML, it shows `fallback`'s case.
 */
export function PickSwitch({
  name,
  fallback,
  cases,
}: {
  name: PickName;
  fallback: string;
  cases: Readonly<Record<string, ReactNode>>;
}) {
  const [value] = usePagePick(name, fallback);
  return <>{cases[value] ?? cases[fallback]}</>;
}
