import type { TargetProps } from '@/lib/context-link.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactElement, ReactNode } from 'react';

/*
 * What every Slide declares (FE-002): the facts a Slide declares beside its
 * Scene, and the kit the container builds by runtime key. `slide` (`slide.ts`)
 * types its kit against these.
 */

/** One value per locale, so a missing German value fails `tsc`. */
export type PerLocale<T> = Readonly<Record<Locale, T>>;

/**
 * One citation of a Speaker note, holding exactly one of `research` or `url` (design-ADR 0016, Citations rules 7 and
 * 8). By default it cites a Research question by id, whose title, link and confidence come from the question; a `url`
 * cites a Source directly and keeps its title as a Translation file leaf.
 */
export type SourceSpec =
  | { readonly slug: string; readonly research: string; readonly url?: never }
  | { readonly slug: string; readonly url: string; readonly research?: never };

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

/**
 * A Context marker on an element, naming one of the Slide's notes: in the element's top-right corner (the default,
 * `className` may move it), or `beside` a label, in its flow.
 */
export type MarkerComponent<N extends string = string> = (props: {
  note: N;
  placement?: 'element' | 'beside';
  className?: string;
}) => ReactElement;

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

/** How a link to a sibling the Episode does not hold behaves: `text` renders the call site's text without a link. */
export interface SlideHrefOptions {
  readonly fallback: 'text';
}

/**
 * The localized `href` of a sibling Slide, named by the slug its author wrote
 * and resolved to this Episode's placement of it (design-ADR 0016, _Slide
 * reuse_ rule 5). A sibling the Episode does not hold throws, failing the
 * build, unless the call site opts into `{ fallback: 'text' }`: it then gets
 * `undefined` and renders its text without a link.
 */
export interface SlideHref {
  (slug: string): string;
  (slug: string, options: SlideHrefOptions): string | undefined;
}

/** The kit as the container builds it, by runtime key. Every `SlideKit` accepts it (see the type tests). */
export interface RuntimeKit {
  readonly t: RuntimeTranslator;
  readonly locale: Locale;
  readonly slideHref: SlideHref;
  readonly template: (key: string) => string;
  readonly ref: (note: string) => RichTag;
  readonly marker: (note: string, className?: string) => RichTag;
  readonly Marker: MarkerComponent;
  readonly target: (name: string) => TargetProps;
  readonly Title: TitleComponent;
}
