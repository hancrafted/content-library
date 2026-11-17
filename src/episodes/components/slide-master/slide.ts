import { withoutSectionSlide as markWithoutSectionSlide, type SectionList } from '@/episodes/lib/episode.pure';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import type { createTranslator, MessageKeys, NestedKeyOf } from 'next-intl';
import type { ReactNode } from 'react';
import type {
  MarkerComponent,
  NoteSpec,
  PerLocale,
  RichTag,
  RuntimeKit,
  SegmentSpec,
  TitleComponent,
} from './slide-base';
import type { SlidePresentation } from './slide-presentation';

/*
 * The Slide (FE-002, `docs/adr/0001-the-slide-is-a-self-contained-folder.md`): one folder
 * `slides/<slide>/` holding its server entry, client widgets, CSS and its own
 * Translation files, `i18n/en.json` and `i18n/de.json`. The Slide hands the
 * container its text with its slug, notes, segments and Scene, so it is typed
 * from its own files and knows no Episode: copying the folder into another
 * Episode is one import and one list entry.
 */

export type SlideMessages = Readonly<Record<string, unknown>>;

type KeysOf<T> = T extends object ? keyof T & string : never;

export type OwnNoteSlug<M> = M extends { readonly notes: infer N } ? KeysOf<N> : never;
export type OwnSegmentSlug<M> = M extends { readonly voiceScript: { readonly segments: infer G } } ? KeysOf<G> : never;
export type OwnTemplateKey<M> = MessageKeys<M, NestedKeyOf<M>>;

export type OwnTranslator<M extends SlideMessages> = ReturnType<typeof createTranslator<M>>;

/**
 * The kit a Slide's `content` receives: `t` and `template` read
 * only its own file; `ref`, `marker`, `Marker` and `target` take only the
 * notes it declares.
 * `slideHref` takes any slug: the container fails the build for one that is not
 * a Slide of the same Episode, since the Slide cannot know which Episode it is in.
 */
export interface OwnSlideKit<M extends SlideMessages, N extends NoteSpec> {
  readonly t: OwnTranslator<M>;
  readonly locale: Locale;
  readonly slideHref: (slug: string) => string;
  readonly template: (key: OwnTemplateKey<M>) => string;
  readonly ref: (note: N['slug']) => RichTag;
  readonly marker: (note: N['slug'], className?: string) => RichTag;
  readonly Marker: MarkerComponent<N['slug']>;
  readonly target: (name: N['target']) => TargetProps;
  readonly Title: TitleComponent;
}

export interface Slide<S extends string = string, M extends SlideMessages = SlideMessages> {
  readonly presentation?: SlidePresentation;
  readonly slug: S;
  readonly messages: PerLocale<M>;
  readonly notes: readonly NoteSpec[];
  readonly segments: readonly SegmentSpec[];
  readonly captionNote?: string;
  readonly captionNotes?: readonly string[];
  readonly headerAction?: (kit: RuntimeKit) => ReactNode;
  readonly content: (kit: RuntimeKit) => ReactNode;
}

export type TitledSlide = Slide<string, { readonly title: string }>;

/**
 * What a Slide's server entry declares. `messages.de` must have the shape of
 * `messages.en` (and is never used to infer it), so a key missing from German
 * fails `tsc` inside the Slide.
 */
export interface OwnSlideSpec<S extends string, M extends SlideMessages, N extends NoteSpec> {
  readonly presentation?: SlidePresentation;
  readonly slug: S;
  readonly messages: { readonly en: M; readonly de: NoInfer<M> };
  readonly notes?: readonly N[];
  readonly segments?: readonly SegmentSpec<OwnSegmentSlug<M>>[];
  readonly captionNote?: N['slug'];
  readonly captionNotes?: readonly N['slug'][];
  /**
   * An action beside the title, such as a Guide's Help button: the Slide header renders it right-aligned in the title
   * row (wrapping under the caption on a phone). The node may render a panel too; it sits under the header, full width,
   * and pushes the Scene down. Read only on the shared header.
   */
  readonly headerAction?: (kit: OwnSlideKit<M, N>) => ReactNode;
  readonly content: (kit: OwnSlideKit<M, N>) => ReactNode;
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
>(spec: OwnSlideSpec<S, M, N>): Slide<S, M> {
  return {
    ...(spec.presentation && { presentation: spec.presentation }),
    slug: spec.slug,
    messages: spec.messages,
    notes: spec.notes ?? [],
    segments: spec.segments ?? [],
    ...captionOf(spec),
    // The runtime kit is assignable to every concrete `OwnSlideKit` (proved in the test); generics hide that here.
    ...(spec.headerAction !== undefined && {
      headerAction: spec.headerAction as unknown as NonNullable<Slide['headerAction']>,
    }),
    content: spec.content as unknown as Slide['content'],
  };
}

export type Section = SectionList<Slide> & readonly [TitledSlide, ...Slide[]];

/**
 * A Section that declares it has no section slide (FE-002): list it as usual, its section slide first, which stays
 * authored for the Section's title and slug but is not shown. The first page Slide takes the Section's anchor. The
 * one implementation is `markWithoutSectionSlide` (`@/episodes/lib/episode.pure`); this is it, typed to the Slides.
 */
export const withoutSectionSlide = markWithoutSectionSlide as (section: readonly [TitledSlide, ...Slide[]]) => Section;

export type PageTone = 'inverse';

export interface EpisodeMessages {
  readonly title: string;
  readonly caption: string;
  readonly description: string;
  readonly notes?: Readonly<Record<string, unknown>>;
  readonly voiceScript?: Readonly<Record<string, unknown>>;
}

export type SlideEntrance = 'typewriter' | 'fade' | 'none';

export type HeaderMode = 'shared' | 'authored';

/**
 * An Episode's composition of Slides: static data. It carries its own
 * text, so no other owner's Translation files hold any of it. What the Episode
 * declares about itself (status, visibility, Video) is its metadata record,
 * loaded by the content store (FE-013). A Template
 * composes its Slides the same way, but is no Episode; both are read by ref
 * through `compositionOf` (`src/episodes/lib/registry.ts`).
 */
export interface EpisodeComposition<Ep extends string = string> {
  readonly agentView?: true;
  /** Configured pages reveal navigation on Title departure by default; visible-from-start bypasses only that entrance. */
  readonly tocEntrance?: 'title-departure' | 'visible-from-start';
  /** One policy for every adjacent edge; incoming enter wins when omitted. */
  readonly transitionPrecedence?: 'enter' | 'leave';
  /** Viewport pixels for semantic tone sampling; absent, the page header's measured lower edge. */
  readonly surfaceSamplingLine?: number;
  readonly slug: Ep;
  readonly messages: PerLocale<EpisodeMessages>;
  readonly notes?: readonly NoteSpec[];
  readonly segments?: readonly SegmentSpec[];
  /**
   * The Title slide's authored hero Scene: the Episode's visual opening, drawn
   * behind and below the container's `h1` and caption. Absent, the Title slide
   * shows its shared glow. Its own text is its Scene's only; the Title slide's
   * notes and Voice script stay on the record.
   */
  readonly title?: Slide;
  /**
   * The Title slide's tone (FE-004 §5.4): `'inverse'` marks the page while that Slide is active, and page chrome
   * (the header, the Contents panel) follows the mark. Absent, the page keeps its own tone.
   */
  readonly tone?: PageTone;
  /**
   * Who renders each Slide's Eyebrow, title and caption. Absent, the Slide
   * wrapper renders the shared Slide header and a Scene holds the visual only;
   * `'authored'` leaves them to each Scene, which renders the kit's `Title`.
   */
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
