import type { TargetProps } from '@/lib/context-link.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactElement, ReactNode } from 'react';

/*
 * What every Slide shape shares (FE-002): the facts a Slide declares beside its
 * Scene, and the kit the container builds by runtime key. Both Slide
 * factories, `slidesFor` (`episode-record.ts`) and `slide` (`slide.ts`), type
 * their kits against these.
 */

/** One value per locale, so a missing German value fails `tsc`. */
export type PerLocale<T> = Readonly<Record<Locale, T>>;

/** A source's non-localized facts; its title is a Translation file leaf. */
export interface SourceSpec {
  readonly slug: string;
  readonly url: string;
}

/**
 * A Speaker note item as a Slide declares it. `target` is the short name of
 * the Scene element it explains (`title`, `prose`, a column slug, or one the
 * Scene marks with the kit's `target`); the drawer finds it inside the Slide
 * (FE-010).
 */
export interface NoteSpec<N extends string = string> {
  readonly slug: N;
  readonly target: string;
  readonly sources?: readonly SourceSpec[];
  readonly image?: { readonly src: string };
}

/** A Voice script segment as a Slide declares it; its time span is counted from its words (`speaking-time.pure.ts`). */
export interface SegmentSpec<G extends string = string> {
  readonly slug: G;
  /** True when the Translation file holds a `bridge` string for this segment. */
  readonly bridge?: boolean;
}

/** The Slide's heading at the level its position gives it (FE-002 §4), marked as the `title` target. */
export type TitleComponent = (props: { children: ReactNode }) => ReactElement;

/** What a `<tag>` in `t.rich` calls: wraps the tagged chunks. */
export type RichTag = (chunks: ReactNode) => ReactNode;

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
