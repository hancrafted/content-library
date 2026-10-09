import { OutcomePerEuroClient } from '@/components/episodes/ai-token-economy/client/outcome-per-euro.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function SubsidyCallout(): ReactElement {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-box border border-base-300 bg-base-200/50 p-4">
      <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 font-mono text-sm font-semibold text-primary">
        2–10×
      </span>
      <p className="text-sm text-base-content/70">
        Today&rsquo;s prices are subsidized — vendors sell intelligence below cost to build adoption. When subsidies
        expire, outcome per euro decides who survives.
      </p>
    </div>
  );
}

export const outcomePerEuro = slide({
  slug: 'outcome-per-euro',
  notes: [{ slug: 'budget-accountability', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <OutcomePerEuroClient />
      <SubsidyCallout />
    </SlideFrame>
  ),
});
