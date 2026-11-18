import type { Locale } from '@/shared/lib/locale.pure';
import { mergeOverride } from '@/shared/lib/override-merge.pure';
import { withoutSectionSlide, type SectionList } from './episode.pure';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export interface InstanceSlide {
  readonly slug: string;
  readonly messages: Readonly<Record<Locale, object>>;
  readonly presentation?: object;
}

export interface InstanceBase<S extends InstanceSlide = InstanceSlide> {
  readonly slug: string;
  readonly messages: Readonly<Record<Locale, object>>;
  readonly notes?: readonly object[];
  readonly title?: S;
  readonly sections: readonly SectionList<S>[];
}

type SlideOf<B> = B extends { readonly sections: readonly (readonly (infer S)[])[] } ? S : never;

export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { readonly [K in keyof T]?: DeepPartial<T[K]> }
    : T;

type OnlyKeysOf<O, M> = O extends readonly unknown[]
  ? O
  : O extends object
    ? { readonly [K in keyof O]: K extends keyof M ? OnlyKeysOf<O[K], M[K]> : never }
    : O;

export interface SlideOverride {
  readonly slug: string;
  readonly messages?: Partial<Readonly<Record<Locale, object>>>;
  readonly presentation?: object;
}

interface Named {
  readonly slug: string;
}

export type SectionOperation<S> =
  | { readonly move: Named; readonly after: Named }
  | { readonly hide: Named }
  | { readonly insert: S; readonly after: Named };

export interface EpisodeOverride<B extends InstanceBase> {
  readonly title?: {
    readonly notes?: B['notes'];
    readonly messages?: { readonly [L in Locale]?: DeepPartial<B['messages'][L]> };
  };
  readonly slides?: readonly SlideOverride[];
  readonly sections?: readonly SectionOperation<SlideOf<B>>[];
}

export function overrideSlide<S extends string, M extends object, P extends object, En = never, De = never>(
  slide: { readonly slug: S; readonly messages: { readonly en: M; readonly de: M }; readonly presentation?: P },
  override: {
    readonly messages?: {
      readonly en?: En & DeepPartial<M> & OnlyKeysOf<En, M>;
      readonly de?: De & DeepPartial<M> & OnlyKeysOf<De, M>;
    };
    readonly presentation?: P;
  },
): SlideOverride {
  return {
    slug: slide.slug,
    ...(override.messages !== undefined && { messages: override.messages }),
    ...(override.presentation !== undefined && { presentation: override.presentation }),
  };
}

const BASES = new WeakMap<object, object>();

export function baseOf<B extends object>(record: B): B | undefined {
  return BASES.get(record) as B | undefined;
}

function notInBase(slug: string, base: InstanceBase): Error {
  return new Error(`Slide "${slug}" is not in the Base Episode "${base.slug}"`);
}

function overriddenSlide<S extends InstanceSlide>(slide: S, override: SlideOverride | undefined): S {
  if (override === undefined) return slide;
  const messages = Object.fromEntries(
    Object.entries(slide.messages).map(([locale, text]) => [
      locale,
      mergeOverride(text, override.messages?.[locale as Locale]),
    ]),
  );
  return {
    ...slide,
    messages,
    ...(override.presentation !== undefined && { presentation: override.presentation }),
  };
}

function sectionLike<S extends Named>(original: SectionList<S>, slides: readonly S[]): SectionList<S> {
  const list = slides as unknown as readonly [S, ...S[]];
  return original.sectionSlide === false ? (withoutSectionSlide(list) as SectionList<S>) : list;
}

function withSlideOverrides<B extends InstanceBase>(base: B, overrides: readonly SlideOverride[]): B {
  const bySlug = new Map(overrides.map((override) => [override.slug, override]));
  const composed = new Set([base.title?.slug, ...base.sections.flat().map(({ slug }) => slug)]);
  const stray = overrides.find(({ slug }) => !composed.has(slug));
  if (stray !== undefined) throw notInBase(stray.slug, base);
  if (bySlug.size === 0) return base;
  const sections = base.sections.map((section) =>
    section.every(({ slug }) => !bySlug.has(slug))
      ? section
      : sectionLike(
          section,
          section.map((slide) => overriddenSlide(slide, bySlug.get(slide.slug))),
        ),
  );
  return {
    ...base,
    ...(base.title !== undefined && { title: overriddenSlide(base.title, bySlug.get(base.title.slug)) }),
    sections,
  };
}

type Place = readonly [section: number, slide: number];

function placeOf(sections: readonly (readonly Named[])[], slug: string, base: InstanceBase): Place {
  for (const [section, slides] of sections.entries()) {
    const slide = slides.findIndex((each) => each.slug === slug);
    if (slide !== -1) return [section, slide];
  }
  throw notInBase(slug, base);
}

function applyOperation<S extends InstanceSlide>(
  sections: S[][],
  operation: SectionOperation<S>,
  base: InstanceBase,
): S[][] {
  if ('hide' in operation) {
    const [section, slide] = placeOf(sections, operation.hide.slug, base);
    if (slide === 0) return sections.filter((_, index) => index !== section);
    sections[section].splice(slide, 1);
    return sections;
  }
  let moved: S;
  if ('move' in operation) {
    const [section, slide] = placeOf(sections, operation.move.slug, base);
    if (slide === 0)
      throw new Error(`Slide "${operation.move.slug}" opens a Section: hide the Section instead of moving it`);
    [moved] = sections[section].splice(slide, 1);
  } else {
    if (sections.some((slides) => slides.some(({ slug }) => slug === operation.insert.slug)))
      throw new Error(`Slide "${operation.insert.slug}" is already in the Base Episode "${base.slug}"`);
    moved = operation.insert;
  }
  const [section, slide] = placeOf(sections, operation.after.slug, base);
  sections[section].splice(slide + 1, 0, moved);
  return sections;
}

function withSectionOperations<B extends InstanceBase>(
  base: B,
  operations: readonly SectionOperation<SlideOf<B>>[],
): B {
  if (operations.length === 0) return base;
  const originals = base.sections as readonly SectionList<SlideOf<B>>[];
  const flags = new Map(originals.map((section) => [section[0].slug, section]));
  const start = originals.map((section) => [...section]);
  const resolved = operations.reduce((sections, operation) => applyOperation(sections, operation, base), start);
  return {
    ...base,
    sections: resolved.map((slides) => sectionLike(flags.get(slides[0].slug) ?? originals[0], slides)),
  };
}

function withTitle<B extends InstanceBase>(base: B, title: EpisodeOverride<B>['title']): B {
  if (title === undefined) return base;
  const messages = Object.fromEntries(
    Object.entries(base.messages).map(([locale, text]) => [
      locale,
      mergeOverride(text, title.messages?.[locale as Locale]),
    ]),
  );
  return { ...base, messages, ...(title.notes !== undefined && { notes: title.notes }) };
}

function applyLayer<B extends InstanceBase>(record: B, layer: EpisodeOverride<B>, base: B): B {
  const titled = withTitle(record, layer.title);
  const overridden = withSlideOverrides(titled, layer.slides ?? []);
  return withSectionOperations({ ...overridden, slug: base.slug }, layer.sections ?? []);
}

export function instanceOf<B extends InstanceBase>(base: B, ...layers: readonly EpisodeOverride<B>[]): B {
  const resolved = layers.reduce<B>((record, layer) => applyLayer(record, layer, base), { ...base });
  BASES.set(resolved, baseOf(base) ?? base);
  return resolved;
}
