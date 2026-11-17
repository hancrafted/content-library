'use client';

import { useReportActiveSlide } from '@/shared/hooks/use-dev-slide';

export function SlideReporter({ folder }: { folder: string }) {
  useReportActiveSlide(folder);
  return null;
}
