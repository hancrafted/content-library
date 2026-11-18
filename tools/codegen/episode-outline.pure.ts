// decision: FE-004 §4
import type { RegistryFile } from './episode-registry.pure.ts';

const EPISODE_OUTLINES_PATH = 'src/episodes/lib/episode-outlines.generated.json';

export interface PlacedSlide {
  readonly slug: string;
  readonly anchor: string;
}

export interface OutlineSlide extends PlacedSlide {
  readonly textSource: string;
  readonly pool: boolean;
}

export interface TextSource {
  readonly textSource: string;
  readonly pool: boolean;
}

export interface OutlineEntry {
  readonly folder: string;
  readonly title?: OutlineSlide;
  readonly sections: readonly (readonly OutlineSlide[])[];
}

export interface OutlineInput {
  readonly id: string;
  readonly folder: string;
  readonly title?: PlacedSlide;
  readonly sections: readonly (readonly PlacedSlide[])[];
}

export function episodeOutlinesFile(
  episodes: readonly OutlineInput[],
  textSourceOf: (folder: string, slug: string) => TextSource,
): RegistryFile {
  const withText = (folder: string) => (slide: PlacedSlide) => ({ ...slide, ...textSourceOf(folder, slide.slug) });
  const entries = [...episodes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(({ id, folder, title, sections }): [string, OutlineEntry] => [
      id,
      {
        folder,
        ...(title === undefined ? {} : { title: withText(folder)(title) }),
        sections: sections.map((section) => section.map(withText(folder))),
      },
    ]);
  return { path: EPISODE_OUTLINES_PATH, text: `${JSON.stringify(Object.fromEntries(entries))}\n` };
}
