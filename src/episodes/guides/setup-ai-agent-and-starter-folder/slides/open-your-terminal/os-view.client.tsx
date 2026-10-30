'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { DEFAULT_OS, osOf, type OsPick } from './os-pick.pure';

/** Shows the server-rendered view of the page's operating-system pick, and only that one. */
export function OsView({ views }: { views: Readonly<Record<OsPick, ReactNode>> }) {
  const [value] = usePagePick('os', DEFAULT_OS);
  return <>{views[osOf(value)]}</>;
}
