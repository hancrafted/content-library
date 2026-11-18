// decision: FE-004 §4
import type { RegistryFile } from './episode-registry.pure.ts';

const EPISODE_OUTLINES_PATH = 'src/episodes/lib/episode-outlines.generated.json';

export interface PlacedSlide {
  readonly slug: string;
  readonly anchor: string;
}

export type TextLayers = Readonly<Record<string, readonly string[]>>;

export interface OutlineSlide extends PlacedSlide {
  readonly text: TextLayers;
  readonly pool: boolean;
}

export interface TextSource {
  readonly text: TextLayers;
  readonly pool: boolean;
}

export interface OutlineEntry {
  readonly folder: string;
  readonly text: TextLayers;
  readonly title?: OutlineSlide;
  readonly sections: readonly (readonly OutlineSlide[])[];
}

export interface OutlineInput {
  readonly id: string;
  readonly folder: string;
  readonly base?: string;
  readonly title?: PlacedSlide;
  readonly sections: readonly (readonly PlacedSlide[])[];
}

export function episodeOutlinesFile(
  episodes: readonly OutlineInput[],
  textSourceOf: (folders: readonly string[], slug: string) => TextSource,
  episodeTextOf: (folders: readonly string[]) => TextLayers,
): RegistryFile {
  const byId = new Map(episodes.map((episode) => [episode.id, episode]));
  const foldersOf = (episode: OutlineInput | undefined): string[] =>
    episode === undefined
      ? []
      : [episode.folder, ...foldersOf(episode.base === undefined ? undefined : byId.get(episode.base))];
  const entryOf = ({ folder, title, sections, ...episode }: OutlineInput): OutlineEntry => {
    const folders = foldersOf({ folder, sections, ...episode });
    const text = (slide: PlacedSlide) => ({ ...slide, ...textSourceOf(folders, slide.slug) });
    return {
      folder,
      text: episodeTextOf(folders),
      ...(title === undefined ? {} : { title: text(title) }),
      sections: sections.map((section) => section.map(text)),
    };
  };
  const entries = [...episodes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((episode): [string, OutlineEntry] => [episode.id, entryOf(episode)]);
  return { path: EPISODE_OUTLINES_PATH, text: `${JSON.stringify(Object.fromEntries(entries))}\n` };
}
