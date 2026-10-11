import type { Messages } from '@/i18n/translations';
import type { SectionList } from '@/lib/episode.pure';
import type { EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import type { SelfContainedEpisodeRecord } from './slide';
import type { NoteSpec, PerLocale, RuntimeKit, SegmentSpec } from './slide-base';

/*
 * The Episode record (FE-002): an Episode is static data that composes Slides;
 * each Slide declares its slug, notes and segments and renders its Scene
 * from a kit; its minutes are counted from its Voice script's words. Types
 * only; no Episode uses this old shape any more, and #58 deletes it. The walk lives in `src/lib/episode.pure.ts`; the kit
 * is built in `slide-kit.tsx`, by the container. Every string a Slide shows lives under its own Translation key,
 * `episodes.<ep>.slides.<slide>.*`, so the slug is written once and `t`, `ref`
 * and `target` are typed from it.
 */

type EpisodesMessages = Messages['episodes'];

/** Episodes whose Translation file subtree is flat by Slide slug: `episodes.<ep>.slides.<slide>.*`. */
export type RecordEpisodeSlug = {
  [E in keyof EpisodesMessages]: EpisodesMessages[E] extends { readonly slides: object } ? E : never;
}[keyof EpisodesMessages] &
  EpisodeSlug;

type SlidesMessages<Ep extends RecordEpisodeSlug> = EpisodesMessages[Ep] extends { readonly slides: infer S }
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
/** One Slide of an Episode record. Static data: its Scene renders only when the container calls `content`. */
export interface Slide<Ep extends RecordEpisodeSlug = RecordEpisodeSlug, S extends string = string> {
  readonly episode: Ep;
  readonly slug: S;
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
export type AnyEpisodeRecord =
  { [E in RecordEpisodeSlug]: EpisodeRecord<E> }[RecordEpisodeSlug] | SelfContainedEpisodeRecord;
