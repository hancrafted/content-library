'use client';

import { PagePicksContext, type PagePicks, type PickName } from '@/episodes/hooks/use-page-pick';
import { useMemo, useState, type ReactNode } from 'react';

// decision: FE-001 §1
export function PagePicksProvider({ children }: { children: ReactNode }) {
  const [picks, setPicks] = useState<PagePicks['picks']>({});
  const value = useMemo<PagePicks>(
    () => ({
      picks,
      setPick: (name: PickName, next: string) =>
        setPicks((now) => (now[name] === next ? now : { ...now, [name]: next })),
    }),
    [picks],
  );
  return <PagePicksContext value={value}>{children}</PagePicksContext>;
}
