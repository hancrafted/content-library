import { activeId, readingLineMargin } from '@/lib/reading-line.pure';
import { useEffect, useState } from 'react';

/**
 * Which of the given element ids spans the reading line; `null` before the
 * first observation. Generic on purpose: it looks the ids up in the document
 * and knows nothing about what they are. The Context drawer uses it so it never
 * has to reach into the table of contents' hooks; both share one reading-line
 * rule (`src/lib/reading-line.pure.ts`), so they agree on the current id.
 */
export function useReadingLineId(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        setActive((previous) => activeId(intersecting, ids, previous));
      },
      { rootMargin: readingLineMargin() },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}
