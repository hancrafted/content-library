import type { TargetProps } from '@/lib/context-link.pure';
import type { SectionList } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { EpisodeSlug } from '@/lib/routes';
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

/*
 * The Slide (FE-002, `docs/adr/0001-the-slide-is-a-self-contained-folder.md`): one folder
 * `slides/<slide>/` holding its server entry, client widgets, CSS and its own
 * Translation files, `i18n/en.json` and `i18n/de.json`. The Slide hands the
 * container its text with its slug, notes, segments and Scene, so it is typed
 * from its own files and knows no Episode: copying the folder into another
 * Episode is one import and one list entry.
 */

/** A Slide's own Translation file, as `import en from './i18n/en.json'` types it. */
export type SlideMessages = Readonly<Record<string, unknown>>;

type KeysOf<T> = T extends object ? keyof T & string : never;

/** The note slugs a Slide's own file translates: `notes.<note>`. */
export type OwnNoteSlug<M> = M extends { readonly notes: infer N } ? KeysOf<N> : never;
/** The segment slugs a Slide's own file translates: `voiceScript.segments.<segment>`. */
export type OwnSegmentSlug<M> = M extends { readonly voiceScript: { readonly segments: infer G } } ? KeysOf<G> : never;
/** A dotted key to a string leaf of a Slide's own file: what `template` reads. */
export type OwnTemplateKey<M> = MessageKeys<M, NestedKeyOf<M>>;

/**
 * next-intl's translator over a Slide's own file: a key outside it fails
 * `tsc`. Its `t.rich` already knows the default `em`, `b` and `code` tags.
 */
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
  /** The page's locale, for formatting a number or date the Translation file does not hold. */
  readonly locale: Locale;
  /** The localized `href` of another Slide of this Episode: its page path and the anchor its position gives it. */
  readonly slideHref: (slug: string) => string;
  /** A string leaf as written, `{name}` placeholders unfilled, for a client component to fill with `fillTemplate`. */
  readonly template: (key: OwnTemplateKey<M>) => string;
  /** The `t.rich` tag for a Context reference to one of this Slide's notes. */
  readonly ref: (note: N['slug']) => RichTag;
  /**
   * The `t.rich` tag that follows a phrase with a Context marker to one of this Slide's notes: `phrase (icon)`;
   * `className` recolours it on a surface the muted default does not suit.
   */
  readonly marker: (note: N['slug'], className?: string) => RichTag;
  /** A Context marker on an element, to one of this Slide's notes; the element must be `relative` unless `className` places it. */
  readonly Marker: MarkerComponent<N['slug']>;
  /** Marks the element one of this Slide's notes explains. */
  readonly target: (name: N['target']) => TargetProps;
  readonly Title: TitleComponent;
}

/**
 * A Slide, as the Episode record holds it. Static data: its
 * Scene renders only when the container calls `content`, with a translator it
 * builds from `messages` for the page's locale.
 */
export interface Slide<S extends string = string, M extends SlideMessages = SlideMessages> {
  readonly slug: S;
  readonly messages: PerLocale<M>;
  readonly notes: readonly NoteSpec[];
  readonly segments: readonly SegmentSpec[];
  readonly content: (kit: RuntimeKit) => ReactNode;
}

/** A Slide whose own file holds a `title`: the only kind that may open a Section. */
export type TitledSlide = Slide<string, { readonly title: string }>;

/**
 * What a Slide's server entry declares. `messages.de` must have the shape of
 * `messages.en` (and is never used to infer it), so a key missing from German
 * fails `tsc` inside the Slide.
 */
export interface OwnSlideSpec<S extends string, M extends SlideMessages, N extends NoteSpec> {
  readonly slug: S;
  readonly messages: { readonly en: M; readonly de: NoInfer<M> };
  readonly notes?: readonly N[];
  readonly segments?: readonly SegmentSpec<OwnSegmentSlug<M>>[];
  readonly content: (kit: OwnSlideKit<M, N>) => ReactNode;
}

/** Declares a Slide; its own Translation files type `t`, `template`, notes and segments. */
export function slide<
  const S extends string,
  M extends SlideMessages,
  const N extends NoteSpec<OwnNoteSlug<M>> = never,
>(spec: OwnSlideSpec<S, M, N>): Slide<S, M> {
  return {
    slug: spec.slug,
    messages: spec.messages,
    notes: spec.notes ?? [],
    segments: spec.segments ?? [],
    // The runtime kit is assignable to every concrete `OwnSlideKit` (proved in the test); generics hide that here.
    content: spec.content as unknown as Slide['content'],
  };
}

/** A Section of Slides: its section slide, which names it, then its page Slides. */
export type Section = SectionList<Slide> & readonly [TitledSlide, ...Slide[]];

/** An Episode's own text, from `i18n/<locale>.json` in its folder: the Title slide's and the page metadata's. */
export interface EpisodeMessages {
  readonly title: string;
  readonly caption: string;
  readonly description: string;
  /** The Title slide's optional Speaker notes and Voice script, laid out as in a Slide's own file (`notes.<note>`, `voiceScript.segments.<segment>`). */
  readonly notes?: Readonly<Record<string, unknown>>;
  readonly voiceScript?: Readonly<Record<string, unknown>>;
}

/** How a Slide header enters the first time its Slide is active (design-ADR-0012). */
export type SlideEntrance = 'typewriter' | 'fade' | 'none';

/** Who renders each Slide's header (design-ADR-0012): the Slide wrapper (`shared`) or each Scene (`authored`). */
export type HeaderMode = 'shared' | 'authored';

/**
 * An Episode record of Slides: static data. It carries its own
 * text, so the site-wide Translation files hold nothing of it.
 */
export interface EpisodeRecord<Ep extends EpisodeSlug = EpisodeSlug> {
  readonly slug: Ep;
  /** One recording per locale, shown on the Title slide; optional until recorded. */
  readonly youtube?: PerLocale<string>;
  readonly messages: PerLocale<EpisodeMessages>;
  /** The Title slide's Speaker notes and Voice script segments, when its text holds them. */
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
   * Who renders each Slide's Eyebrow, title and caption. Absent, the Slide
   * wrapper renders the shared Slide header and a Scene holds the visual only;
   * `'authored'` leaves them to each Scene, which renders the kit's `Title`.
   */
  readonly header?: 'authored';
  /** The Slide header's entrance, once per Episode; `'typewriter'` when absent. */
  readonly entrance?: SlideEntrance;
  readonly sections: readonly Section[];
}

/** An Episode's header mode, read once from its record: the shared header unless the record sets `header: 'authored'`. */
export function headerModeOf(record: Pick<EpisodeRecord, 'header'>): HeaderMode {
  return record.header ?? 'shared';
}

/** An Episode record from its own text and its Sections; each Section's first Slide names it. */
export function episode<Ep extends EpisodeSlug>(record: EpisodeRecord<Ep>): EpisodeRecord<Ep> {
  return record;
}
