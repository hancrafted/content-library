import outlines from '../../episodes/lib/episode-outlines.generated.json' with { type: 'json' };

// decision: FE-004 §4
export interface OutlineSlide {
  readonly slug: string;
  readonly anchor: string;
  readonly textSource: string;
  readonly pool: boolean;
}

export interface EpisodeOutline {
  readonly title?: OutlineSlide;
  readonly sections: readonly (readonly OutlineSlide[])[];
}

interface Entry extends EpisodeOutline {
  readonly folder: string;
}

export function episodeOutline(folder: string): EpisodeOutline {
  const found = (Object.values(outlines) as Entry[]).find((entry) => entry.folder === folder);
  if (found === undefined)
    throw new Error(`No outline for the Episode folder "${folder}": run \`npm run registry\` after adding it`);
  return found;
}
