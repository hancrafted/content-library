'use client';

import { useReportActiveSlide } from '@/hooks/use-dev-slide';

/** Renders nothing: it hands the page's active Slide to the token editor. */
export function SlideReporter() {
  useReportActiveSlide();
  return null;
}
