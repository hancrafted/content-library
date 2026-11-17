'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { DEFAULT_OS, osOf, type OsPick } from './os-pick.pure';

export function OsView({ views }: { views: Readonly<Record<OsPick, ReactNode>> }) {
  const [value] = usePagePick('os', DEFAULT_OS);
  return <>{views[osOf(value)]}</>;
}
