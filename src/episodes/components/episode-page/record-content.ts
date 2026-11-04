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
import { titleLinesOf } from '@/episodes/components/slide-master/title-lines';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { ReactNode } from 'react';
import type { ResolvedSlideTransition, SlidePresentation } from '../slide-master/slide-presentation';
import { slideSizeOf } from './episode-page-container.pure';

/*
 * Turns an Episode record (or the composition of a Template or an Explorable page) into what one locale of its page renders: the
 * Title slide's text and every Slide, localized, in page order. The table of
 * contents, the Context drawer and the Slide wrappers all fold this one list,
 * each Slide under the id its position gives it.
 */

/** One locale's site-wide translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** What the page lends the Episode: the site-wide translator, and the route it is served at when not its own. */
export interface PageContext {
  readonly translatorOf: TranslatorOf;
  /** The page's Episode id, or the slug of its Template or Explorable page: an Event's copy is named by its id, never by its slug alone. */
  readonly id: ComposedId;
  /** The logical path the page is served at, which `slideHref` links on: the Episode's own unless an Event presents it. */
  readonly route?: string;
}

/** Composition's Title appearance, consumed without authored compatibility decisions. */
export interface TitleAppearance {
  /** Semantic tone for header sampling and Title-only navigation. */
  readonly tone: 'normal' | 'inverse';
  /** Legacy wrapper tokens are present only without an authored Title presentation. */
  readonly legacyTone?: PageTone;
  /** Authored mechanics carry the resolved tone; decorative JSX remains server-side. */
  readonly presentation?: SlidePresentation;
  /** Selected only for a toned legacy Title with a first Slide and no resolved outgoing edge. */
  readonly inkTarget?: string;
}

/** What one locale of an Episode renders: the Title slide's text and its Slides in page order. */
export interface EpisodeContent {
  readonly titleAppearance: TitleAppearance;
  readonly tocEntrance?: EpisodeComposition['tocEntrance'];
  readonly transitions: ReadonlyMap<string, ResolvedSlideTransition>;
  readonly title: string;
  readonly caption?: string;
  /** The whole reading time in minutes (`episodeMinutes`): the total the table of contents counts down from. */
  readonly minutes: number;
  readonly slides: readonly LocalizedSlide[];
  /** The Title slide's own Speaker notes and Voice script; both empty for an Episode that gives it none. */
  readonly titleContext: SlideContext;
  /** The record's authored Title slide Scene, rendered; absent for the shared glow. */
  readonly hero?: ReactNode;
  /** Whether the Slide wrapper renders each Slide's header (`shared`) or each Scene does (`authored`). */
  readonly header: HeaderMode;
  readonly entrance: SlideEntrance;
}

/**
 * One locale of an Episode record, walked once (`placeSections`);
 * `translatorOf` serves only the site-wide Context reference and marker labels. The walk's
 * ids are also every kit's `slideHref` targets, so a link cannot drift from
 * the anchor it points at.
 */
export async function recordContent(
  record: EpisodeComposition,
  locale: Locale,
  { translatorOf, id, route = ownRouteOf(id) }: PageContext,
): Promise<EpisodeContent> {
  const drawer = await translatorOf('contextDrawer');
  const episode = contextOf(record, { episode: id, route, locale }, drawer);
  const { title, caption } = record.messages[locale];
  const lines = record.title ? titleLinesOf(record.title, locale) : {};
  const slides = episode.placed.map((placed) => localizeSlide(placed, episode));
  const transitions = transitionsOf(record, slides, episode.header);
  return {
    tocEntrance: record.tocEntrance,
    transitions,
    title: lines.heading ?? title,
    // A title Slide's own caption belongs to its Hero motif, so it takes the Title slide's caption line.
    caption: lines.caption ?? caption,
    minutes: episodeMinutes(record, locale),
    titleContext: titleContext(record, locale),
    ...(record.title && { hero: localizeTitleScene(record.title, episode) }),
    header: episode.header,
    entrance: record.entrance ?? 'typewriter',
    titleAppearance: titleAppearanceOf(record, slides, transitions.has(TITLE_ANCHOR)),
    slides,
  };
}

function titleAppearanceOf(
  record: EpisodeComposition,
  slides: readonly LocalizedSlide[],
  outgoingEdge: boolean,
): TitleAppearance {
  const presentation = record.title?.presentation;
  const tone = presentation?.tone ?? record.tone ?? 'normal';
  if (presentation) return { tone, presentation: { ...presentation, tone } };
  return { tone, legacyTone: record.tone, inkTarget: legacyInkTarget(record.tone, slides[0]?.id, outgoingEdge) };
}

function legacyInkTarget(tone: PageTone | undefined, firstSlide: string | undefined, outgoingEdge: boolean) {
  return tone && firstSlide && !outgoingEdge ? firstSlide : undefined;
}

function contextOf(
  record: EpisodeComposition,
  page: Pick<EpisodeContext, 'episode' | 'route' | 'locale'>,
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

function transitionsOf(record: EpisodeComposition, slides: readonly LocalizedSlide[], header: HeaderMode) {
  const surfaces = slides.map((slide) => ({
    id: slide.id,
    presentation: slide.presentation,
    surface: header === 'shared' && slideSizeOf(slide) === 'section' ? 'var(--section-band)' : 'var(--background)',
  }));
  return resolveTransitions(
    [{ id: TITLE_ANCHOR, presentation: record.title?.presentation }, ...surfaces],
    record.transitionPrecedence,
  );
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
