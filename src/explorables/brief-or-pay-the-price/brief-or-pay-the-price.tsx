import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import { explorableData } from './brief-or-pay-the-price-data';
import { BriefOrPayThePriceClient } from './brief-or-pay-the-price.client';
import type { WordsOverride } from './brief-or-pay-the-price.types';

// decision: FE-012 §2
export interface BriefOrPayThePriceProps {
  readonly locale: string;
  readonly words?: WordsOverride;
}

export function BriefOrPayThePrice({ locale, words }: BriefOrPayThePriceProps) {
  const data = explorableData(locale, words);
  return (
    <>
      <BriefOrPayThePriceClient words={data.words} definitions={data.definitions} />
      <ExploreItLink slug="brief-or-pay-the-price" />
    </>
  );
}
