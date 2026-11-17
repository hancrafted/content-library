import { duplicates } from './duplicates';

export interface CompositionKind {
  readonly noun: string;
  readonly slugs: readonly string[];
  readonly compositions: readonly string[];
  readonly folders: string;
  readonly records: string;
}

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
