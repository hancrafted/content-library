import { FixesSliderClient } from '@/components/episodes/ai-token-economy/client/fixes-slider.client';
import { MODEL_PRICINGS } from '@/components/episodes/ai-token-economy/client/token-economy-data.pure';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function PricingBars(): ReactElement {
  return (
    <div className="space-y-3">
      {MODEL_PRICINGS.map((m) => (
        <div key={m.name} className="rounded-box border border-base-300 bg-base-100 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{m.name}</span>
            <span className="font-mono text-lg font-bold">${m.costPerFix.toFixed(2)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (m.costPerFix / 1.54) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const theCompoundingCostCurve = slide({
  slug: 'the-compounding-cost-curve',
  notes: [{ slug: 'the-14x-spread', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8 space-y-6">
        <PricingBars />
        <FixesSliderClient />
      </div>
    </SlideFrame>
  ),
});
