'use client';

import { useActiveSlide } from '@/shared/hooks/use-url-state';
import { keepReadingScroll } from '@/shared/lib/context-drawer.pure';
import { READING_LINE } from '@/shared/lib/reading-line.pure';
import { TOC_COLLAPSED_ATTR } from '@/shared/lib/table-of-contents.pure';
import { useEffect, useLayoutEffect } from 'react';

function slideBox(id: string | null): { top: number; height: number } | null {
  const rect = id === null ? undefined : document.getElementById(id)?.getBoundingClientRect();
  return rect ? { top: rect.top, height: rect.height } : null;
}

/**
 * Flags the Episode page and TOC aside when the TOC is collapsed, narrowing the left inset
 * so the content area grows. Before paint it adjusts scroll so the reading line stays steady.
 */
export function TocCollapseFlag({ collapsed }: { collapsed: boolean }) {
  const slide = useActiveSlide();
  useLayoutEffect(() => {
    const page = document.querySelector('[data-slot="episode-page"]');
    const toc = document.querySelector('[data-slot="toc"]');
    const isSame = page?.getAttribute(TOC_COLLAPSED_ATTR) === String(collapsed);
    if (page && !isSame) {
      const before = slideBox(slide);
      page.setAttribute(TOC_COLLAPSED_ATTR, String(collapsed));
      const after = slideBox(slide);
      const line = window.innerHeight * READING_LINE;
      if (before && after) window.scrollBy({ top: keepReadingScroll(before, after, line), behavior: 'instant' });
    }
    if (toc) {
      toc.setAttribute(TOC_COLLAPSED_ATTR, String(collapsed));
    }
  }, [collapsed, slide]);

  useEffect(
    () => () => {
      document.querySelector('[data-slot="episode-page"]')?.removeAttribute(TOC_COLLAPSED_ATTR);
      document.querySelector('[data-slot="toc"]')?.removeAttribute(TOC_COLLAPSED_ATTR);
    },
    [],
  );

  return null;
}
