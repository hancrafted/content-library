'use client';

import type { PageTone } from '@/episodes/components/slide-master/slide';
import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { isPlaying } from '@/episodes/lib/slide-zone.pure';
import { ownSignals } from '@/shared/lib/owned-signals';
import { useEffect } from 'react';

export function TitleTone({ tone, geometricTone = false }: { tone: PageTone; geometricTone?: boolean }) {
  const active = isPlaying(useSlideZone());
  useEffect(() => {
    if (!active) return;
    const signals = ownSignals(document.documentElement);
    signals.attribute('data-title-active', 'true');
    if (!geometricTone) signals.attribute('data-page-tone', tone);
    return () => signals.dispose();
  }, [active, tone, geometricTone]);
  return null;
}
