import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { EpisodeContent } from './record-content';
import { SurfaceClockAttachment } from './surface-clock.client';

export function usesSurfaceClock(content: Pick<EpisodeContent, 'titleAppearance' | 'slides' | 'tocEntrance'>) {
  return Boolean(
    content.tocEntrance || content.titleAppearance.presentation || content.slides.some((slide) => slide.presentation),
  );
}

export function tocEntranceOf(
  content: Pick<EpisodeContent, 'titleAppearance' | 'slides' | 'tocEntrance' | 'agentView'>,
) {
  if (content.agentView) return 'visible-from-start';
  return content.tocEntrance ?? (usesSurfaceClock(content) ? 'title-departure' : 'legacy');
}

export function PageSurfaceClock({ content, samplingLine }: { content: EpisodeContent; samplingLine?: number }) {
  if (!usesSurfaceClock(content)) return null;
  return <SurfaceClockAttachment surfaces={surfacesOf(content)} samplingLine={samplingLine} />;
}

function surfacesOf(content: EpisodeContent) {
  const surfaces = [
    {
      id: TITLE_ANCHOR,
      tone: content.titleAppearance.tone,
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
