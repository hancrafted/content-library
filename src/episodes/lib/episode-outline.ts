import { LOCALES, type Locale } from '../../shared/lib/locale.pure.ts';
import outlines from './episode-outlines.generated.json' with { type: 'json' };

// decision: FE-004 §4
export type TextLayer = string | object;
export type TextLayers = Readonly<Record<Locale, readonly TextLayer[]>>;

export { LOCALES, type Locale };

export interface OutlineSlide {
  readonly slug: string;
  readonly anchor: string;
  readonly text: TextLayers;
  readonly pool: boolean;
}

export interface EpisodeOutline {
  readonly base?: string;
  readonly text: TextLayers;
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
