import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import { builtinBundles, catalogWordsFor, localeOf, wordsFor } from './software-ecology-data';
import type { WordsOverride } from './software-ecology-words.types';
import { SoftwareEcologyClient, type Spots } from './software-ecology.client';

/*
 * The software ecology factory, an Explorable (design-ADR 0024): a use case's work centers and belts run live, a
 * document per task, with the Customer's releases coming back. A Slide names the use case and the preset it opens on,
 * may override any word (FE-012), and places its Context targets and markers by spot; the client parent is the one
 * interactive leaf.
 */

export interface SoftwareEcologyProps {
  /** The use case it opens on; the picker offers every shipped one. */
  readonly useCase?: string;
  /** The preset it opens on; Swing by default, the cartoon first. */
  readonly preset?: string;
  /** The URL locale; the German words for `de`, the English ones otherwise. */
  readonly locale: string;
  readonly words?: WordsOverride;
  /** Spots as `SoftwareEcologyClient` names them: `qa:rack`, `qa:unread`, `pm:card`, `customer`, `belts`, `states`. */
  readonly targets?: Spots<TargetProps>;
  readonly markers?: Spots<ReactNode>;
}

export function SoftwareEcology({
  useCase = 'tire',
  preset = 'swing',
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
        catalog={catalogWordsFor(lc)}
        targets={targets}
        markers={markers}
      />
      <ExploreItLink slug="software-ecology" />
    </>
  );
}
