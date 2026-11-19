import { withoutSectionSlide as markWithoutSectionSlide, type SectionList } from '@/episodes/lib/episode.pure';
import type { ExplorablePresetsOf, ExplorablesDeclaration } from '@/shared/lib/explorable-presets';
import type { Locale } from '@/shared/lib/locale.pure';
import type { createTranslator, MessageKeys, NestedKeyOf } from 'next-intl';
import type { ReactNode } from 'react';
import type {
  KitTargetProps,
  MarkerComponent,
  NoteSpec,
  PerLocale,
  RichTag,
  RuntimeKit,
  SegmentSpec,
  TitleComponent,
} from './slide-base';
import type { SlidePresentation } from './slide-presentation';

// decision: FE-002 §2
// decision: docs/decision-records/0001-the-slide-is-a-self-contained-folder.md
export type SlideMessages = Readonly<Record<string, unknown>>;

type KeysOf<T> = T extends object ? keyof T & string : never;

export type OwnNoteSlug<M> = M extends { readonly notes: infer N } ? KeysOf<N> : never;
export type OwnSegmentSlug<M> = M extends { readonly voiceScript: { readonly segments: infer G } } ? KeysOf<G> : never;
export type OwnTemplateKey<M> = MessageKeys<M, NestedKeyOf<M>>;

export type OwnTranslator<M extends SlideMessages> = ReturnType<typeof createTranslator<M>>;

export interface OwnSlideKit<
  M extends SlideMessages,
  N extends NoteSpec,
  E extends ExplorablesDeclaration = Record<never, never>,
> {
  readonly t: OwnTranslator<M>;
  readonly locale: Locale;
  readonly slideHref: (slug: string) => string;
  readonly template: (key: OwnTemplateKey<M>) => string;
  readonly ref: (note: N['slug']) => RichTag;
  readonly marker: (note: N['slug'], className?: string) => RichTag;
  readonly Marker: MarkerComponent<N['slug']>;
  readonly target: (name: N['target']) => KitTargetProps;
  readonly explorables: ExplorablePresetsOf<E>;
  readonly Title: TitleComponent;
}

export interface Slide<S extends string = string, M extends SlideMessages = SlideMessages> {
  readonly presentation?: SlidePresentation;
  readonly slug: S;
  readonly messages: PerLocale<M>;
  readonly notes: readonly NoteSpec[];
  readonly segments: readonly SegmentSpec[];
  readonly explorables?: Readonly<Record<string, string>>;
  readonly hidden?: readonly string[];
  readonly captionNote?: string;
  readonly captionNotes?: readonly string[];
  readonly headerAction?: (kit: RuntimeKit) => ReactNode;
  readonly content: (kit: RuntimeKit) => ReactNode;
}

export type TitledSlide = Slide<string, { readonly title: string }>;

export interface OwnSlideSpec<
  S extends string,
  M extends SlideMessages,
  N extends NoteSpec,
  E extends ExplorablesDeclaration = Record<never, never>,
> {
  readonly presentation?: SlidePresentation;
  readonly slug: S;
  readonly messages: { readonly en: M; readonly de: NoInfer<M> };
  readonly notes?: readonly N[];
  readonly explorables?: E;
  readonly segments?: readonly SegmentSpec<OwnSegmentSlug<M>>[];
  readonly captionNote?: N['slug'];
  readonly captionNotes?: readonly N['slug'][];
  readonly headerAction?: (kit: OwnSlideKit<M, N, E>) => ReactNode;
  readonly content: (kit: OwnSlideKit<M, N, E>) => ReactNode;
}

function captionOf(spec: {
  readonly slug: string;
  readonly captionNote?: string;
  readonly captionNotes?: readonly string[];
}): Pick<Slide, 'captionNote' | 'captionNotes'> {
  const { slug, captionNote, captionNotes } = spec;
  if (captionNote !== undefined && captionNotes !== undefined) {
    throw new Error(`Slide "${slug}" names captionNote and captionNotes: name one note or several, not both.`);
  }
  return { ...(captionNote !== undefined && { captionNote }), ...(captionNotes !== undefined && { captionNotes }) };
}

export function slide<
  const S extends string,
  M extends SlideMessages,
  const N extends NoteSpec<OwnNoteSlug<M>> = never,
  const E extends ExplorablesDeclaration = Record<never, never>,
>(spec: OwnSlideSpec<S, M, N, E>): Slide<S, M> {
  return {
    ...(spec.presentation && { presentation: spec.presentation }),
    slug: spec.slug,
    messages: spec.messages,
    notes: spec.notes ?? [],
    ...(spec.explorables !== undefined && { explorables: spec.explorables }),
    segments: spec.segments ?? [],
    ...captionOf(spec),
    ...(spec.headerAction !== undefined && {
      headerAction: spec.headerAction as unknown as NonNullable<Slide['headerAction']>,
    }),
    content: spec.content as unknown as Slide['content'],
  };
}

export type Section = SectionList<Slide> & readonly [TitledSlide, ...Slide[]];

export const withoutSectionSlide = markWithoutSectionSlide as (section: readonly [TitledSlide, ...Slide[]]) => Section;

export interface EpisodeMessages {
  readonly title: string;
  readonly caption: string;
  readonly description: string;
  readonly notes?: Readonly<Record<string, unknown>>;
  readonly voiceScript?: Readonly<Record<string, unknown>>;
}

export type SlideEntrance = 'typewriter' | 'fade' | 'none';

export type HeaderMode = 'shared' | 'authored';

export interface EpisodeComposition<Ep extends string = string> {
  readonly agentView?: true;
  readonly tocEntrance?: 'title-departure' | 'visible-from-start';
  readonly transitionPrecedence?: 'enter' | 'leave';
  readonly surfaceSamplingLine?: number;
  readonly slug: Ep;
  readonly messages: PerLocale<EpisodeMessages>;
  readonly notes?: readonly NoteSpec[];
  readonly segments?: readonly SegmentSpec[];
  readonly title?: Slide;
  readonly header?: 'authored';
  readonly entrance?: SlideEntrance;
  readonly sections: readonly Section[];
}

export function headerModeOf(record: Pick<EpisodeComposition, 'header'>): HeaderMode {
  return record.header ?? 'shared';
}

export function episode<Ep extends string>(record: EpisodeComposition<Ep>): EpisodeComposition<Ep> {
  return record;
}
