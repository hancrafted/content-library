import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { EpisodeContent } from './record-content';
import { SurfaceClockAttachment } from './surface-clock.client';

/** Server composition supplies only stable ids and semantic tones to the browser. */
export function PageSurfaceClock({ content, samplingLine }: { content: EpisodeContent; samplingLine?: number }) {
  const configured = content.titlePresentation || content.slides.some((slide) => slide.presentation);
  if (!configured) return null;
  const surfaces = [
    { id: TITLE_ANCHOR, tone: content.titlePresentation?.tone ?? content.tone ?? ('normal' as const) },
    ...content.slides.map((slide) => ({ id: slide.id, tone: slide.presentation?.tone ?? ('normal' as const) })),
  ];
  return <SurfaceClockAttachment surfaces={surfaces} samplingLine={samplingLine} />;
}
