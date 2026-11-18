import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { isDeepStrictEqual } from 'node:util';
import { baseOf } from './episode-instance';
import type { InstanceRecord } from './episode-instance.pure';
import { episodeOutline, type TextLayers } from './episode-outline';
import { layeredText } from './episode-outline-text';
import { placeSections } from './episode.pure';

// decision: FE-004 §4
export type LocaleText = Readonly<Record<Locale, unknown>>;

export interface ResolvedSlide {
  readonly slug: string;
  readonly anchor: string;
  readonly text: LocaleText;
}

export interface ResolvedOutline {
  readonly base?: string;
  readonly text: LocaleText;
  readonly title?: ResolvedSlide;
  readonly sections: readonly (readonly ResolvedSlide[])[];
}

const REGISTRY = 'run `npm run registry`';

function recordSlides(composition: InstanceRecord): ResolvedSlide[] {
  return [
    ...(composition.title === undefined
      ? []
      : [{ slug: composition.title.slug, anchor: TITLE_ANCHOR, text: composition.title.messages }]),
    ...placeSections(composition.sections)
      .flat()
      .map(({ id, slide }) => ({ slug: slide.slug, anchor: id, text: slide.messages })),
  ];
}

const outlineSlides = ({ title, sections }: ResolvedOutline): ResolvedSlide[] => [
  ...(title === undefined ? [] : [title]),
  ...sections.flat(),
];

const shapeOf = (base: string | undefined, slides: readonly ResolvedSlide[]) =>
  JSON.stringify({ base, slides: slides.map(({ slug, anchor }) => `${slug}@${anchor}`) });

function textFindings(what: string, expected: LocaleText, traced: LocaleText): string[] {
  return LOCALES.filter((locale) => !isDeepStrictEqual(traced[locale], expected[locale])).map(
    (locale) => `its outline traces the ${locale} ${what} to files holding other text: ${REGISTRY}`,
  );
}

export function staleOutline(composition: InstanceRecord, resolved: ResolvedOutline | undefined): string[] {
  if (resolved === undefined) return [`No outline is registered for the page: ${REGISTRY}`];
  const expected = recordSlides(composition);
  const traced = outlineSlides(resolved);
  if (shapeOf(baseOf(composition)?.slug, expected) !== shapeOf(resolved.base, traced))
    return [`its outline lists other Slides, anchors or another Base Episode: ${REGISTRY}`];
  return [
    ...textFindings('Episode text', composition.messages, resolved.text),
    ...expected.flatMap((slide, index) => textFindings(`text of ${slide.anchor}`, slide.text, traced[index].text)),
  ];
}

export function resolvedOutlineOf(root: string, folder: string): ResolvedOutline | undefined {
  let outline;
  try {
    outline = episodeOutline(folder);
  } catch {
    return undefined;
  }
  const read = (layers: TextLayers): LocaleText =>
    Object.fromEntries(LOCALES.map((locale) => [locale, layeredText(root, layers, locale)])) as LocaleText;
  const slide = ({ slug, anchor, text }: { slug: string; anchor: string; text: TextLayers }): ResolvedSlide => ({
    slug,
    anchor,
    text: read(text),
  });
  return {
    ...(outline.base === undefined ? {} : { base: outline.base }),
    text: read(outline.text),
    ...(outline.title === undefined ? {} : { title: slide(outline.title) }),
    sections: outline.sections.map((section) => section.map(slide)),
  };
}
