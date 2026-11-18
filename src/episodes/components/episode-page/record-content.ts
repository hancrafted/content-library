import { ownRouteOf, type ComposedId } from '@/content-store/catalogue/record-routes';
import {
  episodeMinutes,
  localizeSlide,
  localizeTitleScene,
  titleContext,
  type EpisodeContext,
  type LocalizedSlide,
  type SlideContext,
} from '@/episodes/components/slide-master/localized-slide';
import {
  headerModeOf,
  type EpisodeComposition,
  type HeaderMode,
  type PageTone,
  type Slide,
  type SlideEntrance,
} from '@/episodes/components/slide-master/slide';
import type { RuntimeTranslator } from '@/episodes/components/slide-master/slide-base';
import type { PageIdentity } from '@/episodes/components/slide-master/slide-kit';
import { titleLinesOf } from '@/episodes/components/slide-master/title-lines';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { ReactNode } from 'react';
import type { ResolvedSlideTransition, SlidePresentation } from '../slide-master/slide-presentation';
import { slideSizeOf } from './episode-page-container.pure';
import { standardTitleLook, withStandardSlideLooks } from './standard-looks.pure';

export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

export interface PageContext {
  readonly translatorOf: TranslatorOf;
  readonly id: ComposedId;
  readonly route?: string;
}

export interface TitleAppearance {
  readonly tone: 'normal' | 'inverse';
  readonly legacyTone?: PageTone;
  readonly presentation?: SlidePresentation;
  readonly inkTarget?: string;
}

export interface EpisodeContent {
  readonly agentView?: true;
  readonly titleAppearance: TitleAppearance;
  readonly tocEntrance?: EpisodeComposition['tocEntrance'];
  readonly transitions: ReadonlyMap<string, ResolvedSlideTransition>;
  readonly title: string;
  readonly caption?: string;
  readonly minutes: number;
  readonly slides: readonly LocalizedSlide[];
  readonly titleContext: SlideContext;
  readonly hero?: ReactNode;
  readonly header: HeaderMode;
  readonly entrance: SlideEntrance;
}

export async function recordContent(
  record: EpisodeComposition,
  locale: Locale,
  { translatorOf, id, route = ownRouteOf(id) }: PageContext,
): Promise<EpisodeContent> {
  const drawer = await translatorOf('contextDrawer');
  const episode = contextOf(record, { episode: id, route, locale }, drawer);
  const { title, caption } = record.messages[locale];
  const lines = record.title ? titleLinesOf(record.title, locale) : {};
  const slides = withStandardSlideLooks(episode.placed.map((placed) => localizeSlide(placed, episode)));
  const { transitions, titleAppearance } = composedLooks(record, slides, episode.header);
  return {
    agentView: record.agentView,
    tocEntrance: record.tocEntrance,
    transitions,
    title: lines.heading ?? title,
    caption: lines.caption ?? caption,
    minutes: episodeMinutes(record, locale),
    titleContext: titleContext(record, locale),
    ...(record.title && { hero: localizeTitleScene(record.title, episode) }),
    header: episode.header,
    entrance: record.entrance ?? 'typewriter',
    titleAppearance,
    slides,
  };
}

function composedLooks(record: EpisodeComposition, slides: readonly LocalizedSlide[], header: HeaderMode) {
  const title = standardTitleLook(record.title?.presentation, record.tone);
  const transitions = transitionsOf({ title, precedence: record.transitionPrecedence }, slides, header);
  const titleAppearance = titleAppearanceOf(record, slides, {
    presentation: title,
    outgoingEdge: transitions.has(TITLE_ANCHOR),
  });
  return { transitions, titleAppearance };
}

function titlePresentationOf(
  presentation: SlidePresentation,
  tone: TitleAppearance['tone'],
  legacyTone: PageTone | undefined,
): SlidePresentation {
  return presentation.tone === undefined && legacyTone === undefined ? presentation : { ...presentation, tone };
}

function titleAppearanceOf(
  record: EpisodeComposition,
  slides: readonly LocalizedSlide[],
  { presentation, outgoingEdge }: { presentation: SlidePresentation | undefined; outgoingEdge: boolean },
): TitleAppearance {
  const tone = presentation?.tone ?? record.tone ?? 'normal';
  if (presentation) return { tone, presentation: titlePresentationOf(presentation, tone, record.tone) };
  return { tone, legacyTone: record.tone, inkTarget: legacyInkTarget(record.tone, slides[0]?.id, outgoingEdge) };
}

function legacyInkTarget(tone: PageTone | undefined, firstSlide: string | undefined, outgoingEdge: boolean) {
  return tone && firstSlide && !outgoingEdge ? firstSlide : undefined;
}

function contextOf(
  record: EpisodeComposition,
  page: PageIdentity & Pick<EpisodeContext, 'locale'>,
  drawer: RuntimeTranslator,
): EpisodeContext {
  return {
    ...page,
    placed: placeSections<Slide>(record.sections).flat(),
    header: headerModeOf(record),
    referenceLabels: { ref: drawer('refNote'), marker: (title) => drawer('markerNote', { title }) },
  };
}

function resolveTransitions(
  surfaces: readonly { id: string; presentation?: SlidePresentation; surface?: string }[],
  precedence = 'enter',
): ReadonlyMap<string, ResolvedSlideTransition> {
  const resolved = new Map<string, ResolvedSlideTransition>();
  for (let index = 1; index < surfaces.length; index++) {
    const outgoing = surfaces[index - 1];
    const incoming = surfaces[index];
    const declaration = winningDeclaration(outgoing.presentation?.leave, incoming.presentation?.enter, precedence);
    if (!declaration) continue;
    resolved.set(outgoing.id, {
      id: `${outgoing.id}→${incoming.id}`,
      outgoing: outgoing.id,
      incoming: incoming.id,
      declaration,
      ...transitionTarget(incoming.presentation, incoming.surface),
    });
  }
  return resolved;
}

function transitionsOf(
  {
    title,
    precedence,
  }: { title: SlidePresentation | undefined; precedence: EpisodeComposition['transitionPrecedence'] },
  slides: readonly LocalizedSlide[],
  header: HeaderMode,
) {
  const surfaces = slides.map((slide) => ({
    id: slide.id,
    presentation: slide.presentation,
    surface: header === 'shared' && slideSizeOf(slide) === 'section' ? 'var(--section-band)' : 'var(--background)',
  }));
  return resolveTransitions([{ id: TITLE_ANCHOR, presentation: title }, ...surfaces], precedence);
}

function winningDeclaration(leave: SlidePresentation['leave'], enter: SlidePresentation['enter'], precedence: string) {
  return precedence === 'leave' ? (leave ?? enter) : (enter ?? leave);
}

function transitionTarget(presentation: SlidePresentation | undefined, fallback = 'var(--background)') {
  if (!presentation) return { targetSurface: fallback };
  const { style, tone } = presentation;
  return {
    targetSurface: style?.['--slide-surface'] ?? (tone === 'inverse' ? 'var(--tone-paper)' : 'var(--background)'),
    ...(style && { targetStyle: style }),
  };
}
