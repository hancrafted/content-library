'use client';

import { usePagePick, type PickName } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';

// decision: FE-001 §1
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
