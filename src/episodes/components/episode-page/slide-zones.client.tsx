'use client';

import { ZoneStoreContext } from '@/episodes/hooks/use-slide-zone';
import { createZoneStore } from '@/episodes/lib/slide-zone.pure';
import { useState, type ReactNode } from 'react';

// decision: FE-009 §5
export function SlideZones({ children }: { children: ReactNode }) {
  const [store] = useState(createZoneStore);
  return <ZoneStoreContext value={store}>{children}</ZoneStoreContext>;
}
