import type { Messages } from '@/i18n/translations';
import type { TargetProps } from '@/lib/context-link.pure';
import type { SectionList } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { EpisodeSlug } from '@/lib/routes';
import type { createTranslator, MessageKeys, NamespaceKeys, NestedKeyOf } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

/*
 * The Episode record (FE-002): an Episode is static data that composes Slides;
 * each Slide declares its slug, minutes, notes and segments and renders its
 * Canvas from a kit. Types and factories only. The walk lives in
 * `src/lib/episode.pure.ts`; the kit is built in `slide-kit.tsx`, by the
 * container. Every string a Slide shows lives under its own Translation key,
 * `episodes.<ep>.slides.<slide>.*`, so the slug is written once and `t`, `ref`
 * and `target` are typed from it.
 */

/** One value per locale, so a missing German value fails `tsc`. */
export type PerLocale<T> = Readonly<Record<Locale, T>>;

type EpisodeMessages = Messages['episodes'];

/** Episodes whose Translation file subtree is flat by Slide slug: `episodes.<ep>.slides.<slide>.*`. */
export type RecordEpisodeSlug = {
  [E in keyof EpisodeMessages]: EpisodeMessages[E] extends { readonly slides: object } ? E : never;
}[keyof EpisodeMessages] &
  EpisodeSlug;

type SlidesMessages<Ep extends RecordEpisodeSlug> = EpisodeMessages[Ep] extends { readonly slides: infer S }
  ? S
  : never;
type SlideMessages<Ep extends RecordEpisodeSlug, S> = S extends keyof SlidesMessages<Ep>
  ? SlidesMessages<Ep>[S]
  : never;
type KeysOf<T> = T extends object ? keyof T & string : never;

/** A Slide slug of Episode `Ep`: one with a subtree under `episodes.<ep>.slides`. */
export type SlideSlug<Ep extends RecordEpisodeSlug> = KeysOf<SlidesMessages<Ep>>;
/** A Slide slug whose subtree holds a `title`: only such a Slide can open a Section. */
export type TitledSlideSlug<Ep extends RecordEpisodeSlug> = {
  [S in SlideSlug<Ep>]: SlideMessages<Ep, S> extends { readonly title: string } ? S : never;
}[SlideSlug<Ep>];
/** The note slugs a Slide's subtree translates: `…slides.<slide>.notes.<note>`. */
export type NoteSlug<Ep extends RecordEpisodeSlug, S> =
  SlideMessages<Ep, S> extends { readonly notes: infer N } ? KeysOf<N> : never;
/** The segment slugs a Slide's subtree translates: `…slides.<slide>.voiceScript.segments.<segment>`. */
export type SegmentSlug<Ep extends RecordEpisodeSlug, S> =
  SlideMessages<Ep, S> extends { readonly voiceScript: { readonly segments: infer G } } ? KeysOf<G> : never;

/** A dotted key to a string leaf of a Slide's subtree: what `template` reads. */
export type TemplateKey<Ep extends RecordEpisodeSlug, S> = MessageKeys<
  SlideMessages<Ep, S>,
  NestedKeyOf<SlideMessages<Ep, S>>
>;

type Namespace = NamespaceKeys<Messages, NestedKeyOf<Messages>>;

/**
 * next-intl's translator, namespaced to one Slide: a key outside its subtree
 * fails `tsc`. Its `t.rich` already knows the default `em`, `b` and `code`
 * tags (`rich-tags.tsx`); a Slide passes only `ref` and tags of its own.
 */
export type SlideTranslator<Ep extends RecordEpisodeSlug, S> = `episodes.${Ep}.slides.${S & string}` extends infer N
  ? N extends Namespace
    ? ReturnType<typeof createTranslator<Messages, N>>
    : never
  : never;

/** A source's non-localized facts; its title is a Translation file leaf. */
export interface SourceSpec {
  readonly slug: string;
  readonly url: string;
}

/**
 * A Speaker note item as a Slide declares it. `target` is the short name of
 * the Canvas element it explains (`title`, `prose`, a column slug, or one the
 * Canvas marks with the kit's `target`); the drawer finds it inside the Slide
 * (FE-010).
 */
export interface NoteSpec<N extends string = string> {
  readonly slug: N;
  readonly target: string;
  readonly sources?: readonly SourceSpec[];
  readonly image?: { readonly src: string };
}

/** A Voice script segment as a Slide declares it: its time span in minutes into the Slide. */
export interface SegmentSpec<G extends string = string> {
  readonly slug: G;
  readonly from: number;
  readonly to: number;
  /** True when the Translation file holds a `bridge` string for this segment. */
  readonly bridge?: boolean;
}

/** The Slide's heading at the level its position gives it (FE-002 §4), marked as the `title` target. */
export type TitleComponent = (props: { children: ReactNode }) => ReactElement;

/** What a `<tag>` in `t.rich` calls: wraps the tagged chunks. */
export type RichTag = (chunks: ReactNode) => ReactNode;

/**
 * The kit a Slide's `content` receives. `t` and `template` read only this
 * Slide's Translation keys; `ref` and `target` take only the notes and
 * targets the Slide declares; `slideHref` only this Episode's Slides.
 */
export interface SlideKit<Ep extends RecordEpisodeSlug, S, N extends NoteSpec> {
  readonly t: SlideTranslator<Ep, S>;
  /** The page's locale, for formatting a number or date the Translation file does not hold. */
  readonly locale: Locale;
  /** The localized `href` of another Slide of this Episode: its page path and the anchor its position gives it. */
  readonly slideHref: (slug: SlideSlug<Ep>) => string;
  /** A string leaf as written, `{name}` placeholders unfilled, for a client component to fill with `fillTemplate`. */
  readonly template: (key: TemplateKey<Ep, S>) => string;
  /** The `t.rich` tag for a Context reference to one of this Slide's notes. */
  readonly ref: (note: N['slug']) => RichTag;
  /** Marks the element one of this Slide's notes explains. */
  readonly target: (name: N['target']) => TargetProps;
  readonly Title: TitleComponent;
}

/**
 * A translator read by runtime key: what the container hands every Slide. Its
 * arguments are left open, so it stands in for any Slide's typed translator.
 */
export interface RuntimeTranslator {
  (key: string, ...args: unknown[]): string;
  rich(key: string, ...args: unknown[]): ReactNode;
  markup(key: string, ...args: unknown[]): string;
  raw(key: string): unknown;
  has(key: string): boolean;
}

/** The kit as the container builds it, by runtime key. Every `SlideKit` accepts it (see the type tests). */
export interface RuntimeKit {
  readonly t: RuntimeTranslator;
  readonly locale: Locale;
  readonly slideHref: (slug: string) => string;
  readonly template: (key: string) => string;
  readonly ref: (note: string) => RichTag;
  readonly target: (name: string) => TargetProps;
  readonly Title: TitleComponent;
}

/** One Slide of an Episode record. Static data: its Canvas renders only when the container calls `content`. */
export interface Slide<Ep extends RecordEpisodeSlug = RecordEpisodeSlug, S extends string = string> {
  readonly episode: Ep;
  readonly slug: S;
  /** Spoken reading time per locale; 0 when left out. Set it only on a Slide with a Voice script. */
  readonly minutes?: PerLocale<number>;
  readonly notes: readonly NoteSpec[];
  readonly segments: readonly SegmentSpec[];
  readonly content: (kit: RuntimeKit) => ReactNode;
}

/** A Slide whose Translation subtree holds a `title`: the only kind that may open a Section. */
export type TitledSlide<Ep extends RecordEpisodeSlug = RecordEpisodeSlug> = Slide<Ep, TitledSlideSlug<Ep>>;

/** A Section: its section slide, which names it, then its page Slides. */
export type Section<Ep extends RecordEpisodeSlug = RecordEpisodeSlug> = SectionList<Slide<Ep>> &
  readonly [TitledSlide<Ep>, ...Slide<Ep>[]];

/** An Episode record: static data, composed from Slides. Title and caption are `episodes.<ep>.{title,caption}`. */
export interface EpisodeRecord<Ep extends RecordEpisodeSlug = RecordEpisodeSlug> {
  readonly slug: Ep;
  /** One recording per locale, shown on the Title slide; optional until recorded. */
  readonly youtube?: PerLocale<string>;
  readonly sections: readonly Section<Ep>[];
}

/**
 * The record of any one Episode: a union of `EpisodeRecord<E>` per Episode,
 * not `EpisodeRecord<union>`, whose Slide slugs would collapse to the keys
 * every Episode shares.
 */
export type AnyEpisodeRecord = { [E in RecordEpisodeSlug]: EpisodeRecord<E> }[RecordEpisodeSlug];

/** What a Slide file declares; `slug` is const-inferred and types the rest. */
export interface SlideSpec<Ep extends RecordEpisodeSlug, S extends SlideSlug<Ep>, N extends NoteSpec> {
  readonly slug: S;
  readonly minutes?: PerLocale<number>;
  readonly notes?: readonly N[];
  readonly segments?: readonly SegmentSpec<SegmentSlug<Ep, S>>[];
  readonly content: (kit: SlideKit<Ep, S, N>) => ReactNode;
}

/**
 * Binds the Slide factory to one Episode, so `t` is typed to that Episode's
 * Slides: `const slide = slidesFor('page-template')`.
 */
export function slidesFor<Ep extends RecordEpisodeSlug>(episode: Ep) {
  return function slide<const S extends SlideSlug<Ep>, const N extends NoteSpec<NoteSlug<Ep, S>> = never>(
    spec: SlideSpec<Ep, S, N>,
  ): Slide<Ep, S> {
    return {
      episode,
      slug: spec.slug,
      ...(spec.minutes && { minutes: spec.minutes }),
      notes: spec.notes ?? [],
      segments: spec.segments ?? [],
      // The runtime kit is assignable to every concrete `SlideKit` (proved in the test); generics hide that here.
      content: spec.content as unknown as Slide['content'],
    };
  };
}

/** An Episode record from its Sections; each Section's first Slide names it. */
export function episode<Ep extends RecordEpisodeSlug>(record: EpisodeRecord<Ep>): EpisodeRecord<Ep> {
  return record;
}
