// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-012 §1
import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import { builtinBundles, catalogWordsFor, localeOf, wordsFor } from './software-ecology-data';
import type { WordsOverride } from './software-ecology-words.types';
import { SoftwareEcologyClient, type Spots } from './software-ecology.client';

export interface SoftwareEcologyProps {
  readonly useCase?: string;
  readonly preset?: string;
  readonly locale: string;
  readonly words?: WordsOverride;
  readonly targets?: Spots<TargetProps>;
  readonly markers?: Spots<ReactNode>;
}

export function SoftwareEcology({
  useCase = 'tire',
  preset = 'roles',
  locale,
  words,
  targets,
  markers,
}: SoftwareEcologyProps) {
  const lc = localeOf(locale);
  return (
    <>
      <SoftwareEcologyClient
        bundles={builtinBundles()}
        useCase={useCase}
        preset={preset}
        locale={lc}
        words={wordsFor(lc, words)}
        catalogs={{ en: catalogWordsFor('en'), de: catalogWordsFor('de') }}
        targets={targets}
        markers={markers}
      />
      <ExploreItLink slug="software-ecology" />
    </>
  );
}
