import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import type { ReactElement, ReactNode } from 'react';

// decision: FE-002 §2
export type PerLocale<T> = Readonly<Record<Locale, T>>;

export interface SourceSpec {
  readonly slug: string;
  readonly url: string;
}

// decision: FE-010 §4
export interface NoteSpec<N extends string = string> {
  readonly slug: N;
  readonly target: string;
  readonly sources?: readonly SourceSpec[];
  readonly image?: { readonly src: string };
}

export interface SegmentSpec<G extends string = string> {
  readonly slug: G;
  readonly bridge?: boolean;
}

export type TitleComponent = (props: { children: ReactNode }) => ReactElement;

export type MarkerComponent<N extends string = string> = (props: {
  note: N;
  placement?: 'element' | 'beside';
  className?: string;
}) => ReactElement;

export type RichTag = (chunks: ReactNode) => ReactNode;

export interface RuntimeTranslator {
  (key: string, ...args: unknown[]): string;
  rich(key: string, ...args: unknown[]): ReactNode;
  markup(key: string, ...args: unknown[]): string;
  raw(key: string): unknown;
  has(key: string): boolean;
}

export interface RuntimeKit {
  readonly t: RuntimeTranslator;
  readonly locale: Locale;
  readonly slideHref: (slug: string) => string;
  readonly template: (key: string) => string;
  readonly ref: (note: string) => RichTag;
  readonly marker: (note: string, className?: string) => RichTag;
  readonly Marker: MarkerComponent;
  readonly target: (name: string) => TargetProps;
  readonly Title: TitleComponent;
}
