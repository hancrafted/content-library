'use client';

import type { PageTone } from '@/episodes/components/slide-master/slide';
import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { isPlaying } from '@/episodes/lib/slide-zone.pure';
import { useEffect } from 'react';

/**
 * The page's tone mark (FE-004 §5.4): while the Title slide that declares `tone` is the active Slide, `<html>` carries
 * `data-page-tone`, which page chrome follows. Cleared when the Slide stops being active and when it unmounts
 * (FE-009 §6). Renders nothing.
 */
export function TitleTone({ tone }: { tone: PageTone }) {
  const active = isPlaying(useSlideZone());
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.pageTone = tone;
    return () => {
      delete root.dataset.pageTone;
    };
  }, [active, tone]);
  return null;
}
