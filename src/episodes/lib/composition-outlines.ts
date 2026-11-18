import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { baseOf } from './episode-instance';
import { EPISODES } from './episode-registry.generated';
import { placeSections } from './episode.pure';

// decision: FE-004 §4
export interface PlacedSlide {
  readonly slug: string;
  readonly anchor: string;
}

export interface CompositionOutline {
  readonly base?: string;
  readonly title?: PlacedSlide;
  readonly sections: readonly (readonly PlacedSlide[])[];
}

export function outlineOfComposition(composition: EpisodeComposition): CompositionOutline {
  return {
    ...(composition.title === undefined ? {} : { title: { slug: composition.title.slug, anchor: TITLE_ANCHOR } }),
    sections: placeSections(composition.sections).map((placed) =>
      placed.map(({ id, slide }) => ({ slug: slide.slug, anchor: id })),
    ),
  };
}

function baseIdOf(record: EpisodeComposition): string | undefined {
  const base = baseOf(record);
  if (base === undefined) return undefined;
  const found = Object.entries(EPISODES).find(([, candidate]) => candidate === base);
  if (found === undefined) throw new Error(`The Base Episode of "${record.slug}" is in no Episode folder`);
  return found[0];
}

export function compositionOutlines(): Record<string, CompositionOutline> {
  return Object.fromEntries(
    Object.entries(EPISODES).map(([id, record]) => {
      const base = baseIdOf(record);
      return [id, { ...(base === undefined ? {} : { base }), ...outlineOfComposition(record) }];
    }),
  );
}
