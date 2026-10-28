import { duplicates } from './duplicates';

/** A kind served by slug and the composition folder that holds its Slides, as the refusals name them. */
export interface CompositionKind {
  /** The kind as a sentence names it: `Template`, `Explorable page`. */
  readonly noun: string;
  /** The slugs of the kind's records. */
  readonly slugs: readonly string[];
  /** The names of the composition folders found on disk. */
  readonly compositions: readonly string[];
  /** The folders' parent, `src/episodes/templates`. */
  readonly folders: string;
  /** The records' parent, `src/content-store/templates`. */
  readonly records: string;
}

/**
 * Why the records of a kind served by slug and its composition folders disagree: a slug used twice, a record without a
 * folder, a folder without a record. Each is one sentence naming the record, `<noun> <slug>: …`.
 */
export function compositionRefusals({ noun, slugs, compositions, folders, records }: CompositionKind): string[] {
  const own = (slug: string, sentence: string) => `${noun} ${slug}: ${sentence}`;
  return [
    ...duplicates(slugs).map((slug) => own(slug, `slug is used by more than one ${noun}`)),
    ...slugs
      .filter((slug) => !compositions.includes(slug))
      .map((slug) => own(slug, `no composition folder ${folders}/${slug}/ holds its Slides`)),
    ...compositions
      .filter((slug) => !slugs.includes(slug))
      .map((slug) => own(slug, `the composition folder ${folders}/${slug}/ has no record ${records}/${slug}.ts`)),
  ];
}
