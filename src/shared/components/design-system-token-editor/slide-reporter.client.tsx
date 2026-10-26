'use client';

import { useReportActiveSlide } from '@/shared/hooks/use-dev-slide';

/** Renders nothing: it hands the page's active Slide, and the source folder its Slides sit in, to the token editor. */
export function SlideReporter({ folder }: { folder: string }) {
  useReportActiveSlide(folder);
  return null;
}
