import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { instanceTrailOf } from './episode-instance';
import type { InstanceBase, InstanceSlide, OverrideLayer } from './episode-instance.pure';
import { placeSections } from './episode.pure';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export type TextOf<T> = Readonly<Record<Locale, readonly T[]>>;

export interface OutlinedSlide<T> {
  readonly slug: string;
  readonly anchor: string;
  readonly text: TextOf<T>;
}

export interface RecordOutline<T> {
  readonly base?: string;
  readonly text: TextOf<T>;
  readonly title?: OutlinedSlide<T>;
  readonly sections: readonly (readonly OutlinedSlide<T>[])[];
}

type Messages = Readonly<Record<Locale, object>>;

function perLocale(first: Messages, layers: readonly (Partial<Messages> | undefined)[]): TextOf<object> {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      [first[locale], ...layers.flatMap((layer) => (layer?.[locale] === undefined ? [] : [layer[locale]]))],
    ]),
  ) as unknown as TextOf<object>;
}

function originOf(slug: string, base: InstanceBase, layers: readonly OverrideLayer[]): Messages {
  const composed = [base.title, ...base.sections.flat()].find((slide) => slide?.slug === slug);
  if (composed !== undefined) return composed.messages;
  const inserted = layers
    .flatMap((layer) => layer.sections ?? [])
    .flatMap((operation) => ('insert' in operation && operation.insert.slug === slug ? [operation.insert] : []));
  if (inserted[0] === undefined) throw new Error(`Slide "${slug}" of "${base.slug}" comes from no Slide record`);
  return inserted[0].messages;
}

export function recordOutline(record: InstanceBase): RecordOutline<object> {
  const trail = instanceTrailOf(record);
  const base = trail?.base ?? record;
  const layers = trail?.layers ?? [];
  const textOf = (slug: string) =>
    perLocale(
      originOf(slug, base, layers),
      layers.map((layer) => layer.slides?.[slug]?.messages),
    );
  const outlined = (slide: InstanceSlide, anchor: string) => ({ slug: slide.slug, anchor, text: textOf(slide.slug) });
  return {
    ...(trail === undefined ? {} : { base: base.slug }),
    text: perLocale(
      base.messages,
      layers.map((layer) => layer.title?.messages),
    ),
    ...(record.title === undefined ? {} : { title: outlined(record.title, TITLE_ANCHOR) }),
    sections: placeSections(record.sections).map((placed) => placed.map(({ id, slide }) => outlined(slide, id))),
  };
}

export function withTextAs<T, U>(outline: RecordOutline<T>, convert: (text: T) => U): RecordOutline<U> {
  const text = (layers: TextOf<T>) =>
    Object.fromEntries(LOCALES.map((locale) => [locale, layers[locale].map(convert)])) as unknown as TextOf<U>;
  const slide = ({ slug, anchor, text: layers }: OutlinedSlide<T>): OutlinedSlide<U> => ({
    slug,
    anchor,
    text: text(layers),
  });
  return {
    ...(outline.base === undefined ? {} : { base: outline.base }),
    text: text(outline.text),
    ...(outline.title === undefined ? {} : { title: slide(outline.title) }),
    sections: outline.sections.map((section) => section.map(slide)),
  };
}
