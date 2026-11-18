// decision: FE-004 §4
import { SLIDE_POOL_FOLDER } from '../../src/episodes/lib/episode-folders.ts';
import type { RegistryFile } from './episode-registry.pure.ts';

const EPISODE_OUTLINES_PATH = 'src/episodes/lib/episode-outlines.generated.json';
const POOL_PREFIX = `src/episodes/${SLIDE_POOL_FOLDER}/`;

export type TextLayer = string | object;
export type TextLayers = Readonly<Record<string, readonly TextLayer[]>>;

export interface TracedSlide {
  readonly slug: string;
  readonly anchor: string;
  readonly text: TextLayers;
}

export interface OutlineSlide extends TracedSlide {
  readonly pool: boolean;
}

export interface OutlineInput {
  readonly id: string;
  readonly folder: string;
  readonly base?: string;
  readonly text: TextLayers;
  readonly title?: TracedSlide;
  readonly sections: readonly (readonly TracedSlide[])[];
}

export interface OutlineEntry {
  readonly folder: string;
  readonly base?: string;
  readonly text: TextLayers;
  readonly title?: OutlineSlide;
  readonly sections: readonly (readonly OutlineSlide[])[];
}

function pooled(id: string, slide: TracedSlide): OutlineSlide {
  const home = Object.values(slide.text)[0]?.[0];
  if (typeof home !== 'string') throw new Error(`Slide "${slide.slug}" of ${id} has no text file`);
  return { slug: slide.slug, anchor: slide.anchor, pool: home.startsWith(POOL_PREFIX), text: slide.text };
}

function entryOf({ id, folder, base, text, title, sections }: OutlineInput): OutlineEntry {
  return {
    folder,
    text,
    ...(base === undefined ? {} : { base }),
    ...(title === undefined ? {} : { title: pooled(id, title) }),
    sections: sections.map((section) => section.map((slide) => pooled(id, slide))),
  };
}

export function episodeOutlinesFile(episodes: readonly OutlineInput[]): RegistryFile {
  const entries = [...episodes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((episode): [string, OutlineEntry] => [episode.id, entryOf(episode)]);
  return { path: EPISODE_OUTLINES_PATH, text: `${JSON.stringify(Object.fromEntries(entries))}\n` };
}
