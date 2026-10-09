'use client';

import { ZoneStoreContext } from '@/hooks/use-slide-zone';
import { useUrlState } from '@/hooks/use-url-state';
import { activeId, readingLineMargin } from '@/lib/reading-line.pure';
import { APPROACH_ROOT_MARGIN, type ZoneStore } from '@/lib/slide-zone.pure';
import type { UrlState } from '@/lib/url-state';
import { useContext, useEffect } from 'react';

/** One observer over every Slide wrapper, narrowed by `rootMargin`. */
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

/**
 * The reading-line threshold: whichever wrapper spans the line is active. It
 * tells the zone store and reports to the URL service. The Title slide is the
 * first id, so scrolling back up to it makes it active and clears the previous
 * Slide. Only a gap between wrappers reports nothing, and the last id stays.
 */
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

/** The approach threshold: a wider margin that decides `near`, touching nothing but the zone store. */
function approachObserver(ids: readonly string[], zones: ZoneStore | null): IntersectionObserver {
  return observeWrappers(ids, APPROACH_ROOT_MARGIN, (entries) => {
    for (const entry of entries) zones?.setNear(entry.target.id, entry.isIntersecting);
  });
}

/**
 * The one viewport observer of an Episode page (FE-009 §5), and the only
 * caller of `urlState.reportReading` (FE-001 §2). A `rootMargin` belongs to an
 * observer, so its two thresholds are two instances made here and nowhere
 * else. `ids` starts with the Title slide's. Renders nothing.
 */
export function SlideObserver({ ids }: { ids: readonly string[] }) {
  const zones = useContext(ZoneStoreContext);
  const url = useUrlState();
  useEffect(() => {
    const observers = [readingLineObserver(ids, zones, url), approachObserver(ids, zones)];
    return () => observers.forEach((observer) => observer.disconnect());
  }, [ids, zones, url]);
  return null;
}
