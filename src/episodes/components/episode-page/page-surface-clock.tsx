import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { EpisodeContent } from './record-content';
import { SurfaceClockAttachment } from './surface-clock.client';

/** Composition opts into one geometry authority, including explicit entrance policy without an effect. */
export function usesSurfaceClock(content: Pick<EpisodeContent, 'titlePresentation' | 'slides' | 'tocEntrance'>) {
  return Boolean(
    content.tocEntrance || content.titlePresentation || content.slides.some((slide) => slide.presentation),
  );
}

/** Entrance policy depends on composition, never the active Slide or sampled tone. */
export function tocEntranceOf(content: Pick<EpisodeContent, 'titlePresentation' | 'slides' | 'tocEntrance'>) {
  return content.tocEntrance ?? (usesSurfaceClock(content) ? 'title-departure' : 'legacy');
}

/** Server composition supplies only stable ids and semantic tones to the browser. */
export function PageSurfaceClock({ content, samplingLine }: { content: EpisodeContent; samplingLine?: number }) {
  if (!usesSurfaceClock(content)) return null;
  return <SurfaceClockAttachment surfaces={surfacesOf(content)} samplingLine={samplingLine} />;
}

function surfacesOf(content: EpisodeContent) {
  const surfaces = [
    {
      id: TITLE_ANCHOR,
      tone: content.titlePresentation?.tone ?? content.tone ?? ('normal' as const),
      effect: content.transitions.get(TITLE_ANCHOR)?.declaration.effect,
    },
    ...content.slides.map((slide) => ({
      id: slide.id,
      tone: slide.presentation?.tone ?? ('normal' as const),
      effect: content.transitions.get(slide.id)?.declaration.effect,
    })),
  ];
  return surfaces;
}
