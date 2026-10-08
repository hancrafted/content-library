'use client';

import { activeId, readingLineMargin } from '@/lib/reading-line.pure';
import { urlState } from '@/lib/url-state';
import { useEffect } from 'react';

/**
 * The one viewport observer of an Episode page (FE-009 §5), and the only caller
 * of `urlState.reportReading` (FE-001 §2). It watches every Slide wrapper by id
 * and reports whichever spans the reading line. While the line sits above the
 * first wrapper (the Title slide) nothing crosses it, so nothing is reported
 * and the hash stays as it was. Renders nothing.
 */
export function SlideObserver({ ids }: { ids: readonly string[] }) {
  useEffect(() => {
    const intersecting = new Set<string>();
    let reported: string | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        if (intersecting.size === 0) return;
        const next = activeId(intersecting, ids, reported);
        if (next === null || next === reported) return;
        reported = next;
        urlState.reportReading(next);
      },
      { rootMargin: readingLineMargin() },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);
  return null;
}
