import type { Locale } from '@/shared/lib/locale.pure';
import { mergeOverride } from '@/shared/lib/override-merge.pure';
import { withoutSectionSlide, type SectionList } from './episode.pure';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export interface InstanceSlide {
  readonly slug: string;
  readonly messages: Readonly<Record<Locale, object>>;
  readonly presentation?: object;
}

export interface InstanceRecord<S extends InstanceSlide = InstanceSlide> {
  readonly slug: string;
  readonly messages: Readonly<Record<Locale, object>>;
  readonly notes?: readonly object[];
  readonly title?: S;
  readonly sections: readonly SectionList<S>[];
}

export type SlideOf<R> = R extends { readonly sections: readonly (readonly (infer S)[])[] } ? S : never;

export interface SlideOverride {
  readonly messages?: Partial<Readonly<Record<Locale, object>>>;
  readonly presentation?: object;
}

export type SectionOperation<S, Slug extends string = string> =
  | { readonly move: Slug; readonly after: Slug }
  | { readonly hide: Slug }
  | { readonly insert: S; readonly after: Slug };

export interface TitleOverride {
  readonly notes?: readonly object[];
  readonly messages?: Partial<Readonly<Record<Locale, object>>>;
}

export interface OverrideLayer<S = InstanceSlide> {
  readonly title?: TitleOverride;
  readonly sections?: readonly SectionOperation<S>[];
  readonly slides?: Readonly<Record<string, SlideOverride>>;
}

interface WorkingSection<S> {
  readonly slides: S[];
  readonly sectionSlide: boolean;
}

function notInBase(slug: string, base: InstanceRecord): Error {
  return new Error(`Slide "${slug}" is not in the Base Episode "${base.slug}"`);
}

function mergedMessages<M extends Readonly<Record<Locale, object>>>(
  messages: M,
  override: Partial<Readonly<Record<Locale, object>>> | undefined,
): M {
  if (override === undefined) return messages;
  return Object.fromEntries(
    Object.entries(messages).map(([locale, text]) => [locale, mergeOverride(text, override[locale as Locale])]),
  ) as M;
}

function overriddenSlide<S extends InstanceSlide>(slide: S, override: SlideOverride | undefined): S {
  if (override === undefined) return slide;
  return {
    ...slide,
    messages: mergedMessages(slide.messages, override.messages),
    ...(override.presentation !== undefined && { presentation: override.presentation }),
  };
}

const openerIndexOf = (section: WorkingSection<unknown>): number => (section.sectionSlide ? 0 : 1);

interface Arrangement<S> {
  readonly sections: WorkingSection<S>[];
  readonly base: InstanceRecord;
}

function placeOf<S extends InstanceSlide>(
  { sections, base }: Arrangement<S>,
  slug: string,
): readonly [section: number, slide: number] {
  for (const [section, { slides }] of sections.entries()) {
    const slide = slides.findIndex((each) => each.slug === slug);
    if (slide !== -1) return [section, slide];
  }
  throw notInBase(slug, base);
}

function placeAfter<S extends InstanceSlide>(arrangement: Arrangement<S>, placed: S, after: string): void {
  const [section, slide] = placeOf(arrangement, after);
  const target = arrangement.sections[section];
  if (slide + 1 === openerIndexOf(target))
    throw new Error(
      `Slide "${placed.slug}" would take over the anchor of the Section "${target.slides[0].slug}" from "${target.slides[1].slug}"`,
    );
  target.slides.splice(slide + 1, 0, placed);
}

function applyOperation<S extends InstanceSlide>(
  arrangement: Arrangement<S>,
  operation: SectionOperation<S>,
): Arrangement<S> {
  const { sections, base } = arrangement;
  if ('hide' in operation) {
    const [section, slide] = placeOf(arrangement, operation.hide);
    if (slide <= openerIndexOf(sections[section]))
      return { base, sections: sections.filter((_, index) => index !== section) };
    sections[section].slides.splice(slide, 1);
    return arrangement;
  }
  if ('move' in operation) {
    const [section, slide] = placeOf(arrangement, operation.move);
    if (slide <= openerIndexOf(sections[section]))
      throw new Error(`Slide "${operation.move}" opens a Section: hide the Section instead of moving it`);
    const [moved] = sections[section].slides.splice(slide, 1);
    placeAfter(arrangement, moved, operation.after);
    return arrangement;
  }
  if (sections.some(({ slides }) => slides.some(({ slug }) => slug === operation.insert.slug)))
    throw new Error(`Slide "${operation.insert.slug}" is already in the Base Episode "${base.slug}"`);
  placeAfter(arrangement, operation.insert, operation.after);
  return arrangement;
}

function sectionListOf<S extends InstanceSlide>({ slides, sectionSlide }: WorkingSection<S>): SectionList<S> {
  const list = slides as unknown as readonly [S, ...S[]];
  return sectionSlide ? list : (withoutSectionSlide(list) as SectionList<S>);
}

function withSectionOperations<R extends InstanceRecord>(
  record: R,
  operations: readonly SectionOperation<SlideOf<R>>[],
  base: InstanceRecord,
): R {
  if (operations.length === 0) return record;
  const start = (record.sections as readonly SectionList<SlideOf<R>>[]).map((section) => ({
    slides: [...section],
    sectionSlide: section.sectionSlide !== false,
  }));
  const resolved = operations.reduce(applyOperation<SlideOf<R>>, { sections: start, base });
  return { ...record, sections: resolved.sections.map(sectionListOf) };
}

const composedSlugs = (record: InstanceRecord): Set<string> =>
  new Set([record.title?.slug, ...record.sections.flat().map(({ slug }) => slug)].filter((slug) => slug !== undefined));

function withSlideOverrides<R extends InstanceRecord>(
  record: R,
  overrides: Readonly<Record<string, SlideOverride>>,
  { known, base }: { readonly known: ReadonlySet<string>; readonly base: InstanceRecord },
): R {
  const stray = Object.keys(overrides).find((slug) => !known.has(slug));
  if (stray !== undefined) throw notInBase(stray, base);
  if (Object.keys(overrides).length === 0) return record;
  const sections = record.sections.map((section) =>
    section.every(({ slug }) => overrides[slug] === undefined)
      ? section
      : sectionListOf({
          slides: section.map((slide) => overriddenSlide(slide, overrides[slide.slug])),
          sectionSlide: section.sectionSlide !== false,
        }),
  );
  return {
    ...record,
    ...(record.title !== undefined && { title: overriddenSlide(record.title, overrides[record.title.slug]) }),
    sections,
  };
}

function withTitle<R extends InstanceRecord>(record: R, title: TitleOverride | undefined): R {
  if (title === undefined) return record;
  return {
    ...record,
    messages: mergedMessages(record.messages, title.messages),
    ...(title.notes !== undefined && { notes: title.notes }),
  };
}

function applyLayer<R extends InstanceRecord>(record: R, layer: OverrideLayer<SlideOf<R>>, base: R): R {
  const titled = withTitle(record, layer.title);
  const known = composedSlugs(titled);
  const arranged = withSectionOperations(titled, layer.sections ?? [], base);
  composedSlugs(arranged).forEach((slug) => known.add(slug));
  return withSlideOverrides(arranged, layer.slides ?? {}, { known, base });
}

export function resolveLayers<R extends InstanceRecord>(base: R, layers: readonly OverrideLayer<SlideOf<R>>[]): R {
  return layers.reduce<R>((record, layer) => applyLayer(record, layer, base), { ...base });
}
