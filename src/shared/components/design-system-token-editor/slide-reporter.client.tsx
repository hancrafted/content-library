'use client';

import { useReportActiveSlide } from '@/shared/hooks/use-dev-slide';

/** Renders nothing: it hands the page's active Slide, and the source folder the page names, to the token editor. */
export function SlideReporter({ folder }: { folder: string }) {
  useReportActiveSlide(folder);
  return null;
}
