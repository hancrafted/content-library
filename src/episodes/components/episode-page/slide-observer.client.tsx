'use client';

import { ZoneStoreContext } from '@/episodes/hooks/use-slide-zone';
import { APPROACH_ROOT_MARGIN, type ZoneStore } from '@/episodes/lib/slide-zone.pure';
import { useUrlState } from '@/shared/hooks/use-url-state';
import { activeId, readingLineMargin } from '@/shared/lib/reading-line.pure';
import type { UrlState } from '@/shared/lib/url-state';
import { useContext, useEffect } from 'react';

function observeWrappers(
  ids: readonly string[],
  rootMargin: string,
  onEntries: (entries: IntersectionObserverEntry[]) => void,
): IntersectionObserver {
  const observer = new IntersectionObserver(onEntries, { rootMargin });
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  }
  return observer;
}

function trackCrossing(intersecting: Set<string>, entries: readonly IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (entry.isIntersecting) intersecting.add(entry.target.id);
    else intersecting.delete(entry.target.id);
  }
}

function readingLineObserver(
  ids: readonly string[],
  zones: ZoneStore | null,
  url: UrlState | null,
): IntersectionObserver {
  const intersecting = new Set<string>();
  let reported: string | null = null;
  return observeWrappers(ids, readingLineMargin(), (entries) => {
    trackCrossing(intersecting, entries);
    if (intersecting.size === 0) return;
    const next = activeId(intersecting, ids, reported);
    if (next === null || next === reported) return;
    reported = next;
    zones?.setActive(next);
    url?.reportReading(next);
  });
}

function approachObserver(ids: readonly string[], zones: ZoneStore | null): IntersectionObserver {
  return observeWrappers(ids, APPROACH_ROOT_MARGIN, (entries) => {
    for (const entry of entries) zones?.setNear(entry.target.id, entry.isIntersecting);
  });
}

// decision: FE-009 §5
// decision: FE-001 §2
export function SlideObserver({ ids }: { ids: readonly string[] }) {
  const zones = useContext(ZoneStoreContext);
  const url = useUrlState();
  useEffect(() => {
    const observers = [readingLineObserver(ids, zones, url), approachObserver(ids, zones)];
    return () => observers.forEach((observer) => observer.disconnect());
  }, [ids, zones, url]);
  return null;
}
