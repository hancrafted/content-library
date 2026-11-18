import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { ReactNode } from 'react';
import { explorableData } from './brief-or-pay-the-price-data';
import { BriefOrPayThePriceClient } from './brief-or-pay-the-price.client';
import type { PresetId, WordsOverride } from './brief-or-pay-the-price.types';

// decision: FE-012 §2
export interface BriefOrPayThePriceProps {
  readonly preset: PresetId;
  readonly locale: string;
  readonly words?: WordsOverride;
  readonly habits?: ReactNode;
  readonly tryIt?: ReactNode;
}

export function BriefOrPayThePrice({ preset, locale, words, habits, tryIt }: BriefOrPayThePriceProps) {
  const data = explorableData(locale, words);
  return (
    <>
      <BriefOrPayThePriceClient
        preset={data.presets[preset]}
        words={data.words}
        definitions={data.definitions}
        stages={data.stages}
        scenarios={data.scenarios}
        matrix={data.matrix}
        habits={habits}
        tryIt={tryIt}
      />
      <ExploreItLink slug="brief-or-pay-the-price" />
    </>
  );
}
