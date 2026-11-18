import type { Locale } from '@/shared/lib/locale.pure';
import {
  resolveLayers,
  type InstanceRecord,
  type OverrideLayer,
  type SectionOperation,
  type SlideOf,
} from './episode-instance.pure';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
declare const NO_BASE_EPISODE: unique symbol;

export interface BaseSlideMessages {
  readonly [NO_BASE_EPISODE]?: never;
}

type SlidesOf<B> = B extends { readonly slug: infer Slug }
  ? Slug extends keyof BaseSlideMessages
    ? NonNullable<BaseSlideMessages[Slug]>
    : Record<never, never>
  : Record<never, never>;

export type SlugOf<B> = keyof SlidesOf<B> & string;

export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { readonly [K in keyof T]?: DeepPartial<T[K]> }
    : T;

type OnlyKeysOf<O, M> = O extends readonly unknown[]
  ? O
  : unknown extends M
    ? O
    : O extends object
      ? { readonly [K in keyof O]: K extends keyof NonNullable<M> ? OnlyKeysOf<O[K], NonNullable<M>[K]> : never }
      : O;

type LocalePartials<M> = { readonly [L in Locale]?: L extends keyof M ? DeepPartial<M[L]> : never };

type PresentationOf<B> = SlideOf<B> extends { readonly presentation?: infer P } ? P : object;

export interface EpisodeOverride<B extends InstanceRecord> {
  readonly title?: { readonly notes?: B['notes']; readonly messages?: LocalePartials<B['messages']> };
  readonly slides?: {
    readonly [S in SlugOf<B>]?: {
      readonly messages?: LocalePartials<SlidesOf<B>[S]>;
      readonly presentation?: PresentationOf<B>;
    };
  };
  readonly sections?: readonly SectionOperation<SlideOf<B>, SlugOf<B>>[];
}

type ExactLocales<O, M> = { readonly [L in keyof O]: L extends keyof M ? OnlyKeysOf<O[L], M[L]> : never };

type ExactSlide<O, M> = {
  readonly [K in keyof O]: K extends 'messages' ? ExactLocales<O[K], M> : K extends 'presentation' ? O[K] : never;
};

type ExactLayer<O, B extends InstanceRecord> = {
  readonly [K in keyof O]: K extends 'title'
    ? { readonly [T in keyof O[K]]: T extends 'messages' ? ExactLocales<O[K][T], B['messages']> : O[K][T] }
    : K extends 'slides'
      ? { readonly [S in keyof O[K]]: S extends SlugOf<B> ? ExactSlide<O[K][S], SlidesOf<B>[S]> : never }
      : K extends 'sections'
        ? O[K]
        : never;
};

export interface InstanceTrail<B> {
  readonly base: B;
  readonly layers: readonly OverrideLayer[];
}

const TRAILS = new WeakMap<object, InstanceTrail<object>>();

export function instanceTrailOf<B extends object>(record: B): InstanceTrail<B> | undefined {
  return TRAILS.get(record) as InstanceTrail<B> | undefined;
}

export function baseOf<B extends object>(record: B): B | undefined {
  return instanceTrailOf(record)?.base;
}

export function instanceOf<B extends InstanceRecord, L extends readonly EpisodeOverride<B>[]>(
  base: B,
  ...layers: L & { readonly [I in keyof L]: ExactLayer<L[I], B> }
): B {
  const resolved = resolveLayers(base, layers as readonly OverrideLayer<SlideOf<B>>[]);
  const earlier = instanceTrailOf(base);
  TRAILS.set(resolved, {
    base: earlier?.base ?? base,
    layers: [...(earlier?.layers ?? []), ...(layers as readonly OverrideLayer[])],
  });
  return resolved;
}
