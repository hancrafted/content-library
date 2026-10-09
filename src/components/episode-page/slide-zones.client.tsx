'use client';

import { ZoneStoreContext } from '@/hooks/use-slide-zone';
import { createZoneStore } from '@/lib/slide-zone.pure';
import { useState, type ReactNode } from 'react';

/**
 * Provides one zone store to an Episode page's Slide observer and mounts
 * (FE-009 §5). It lives with the page, so navigating to another Episode
 * mounts a fresh provider and starts every Slide from scratch. Renders no
 * element of its own, so the page grid is untouched.
 */
export function SlideZones({ children }: { children: ReactNode }) {
  const [store] = useState(createZoneStore);
  return <ZoneStoreContext value={store}>{children}</ZoneStoreContext>;
}
