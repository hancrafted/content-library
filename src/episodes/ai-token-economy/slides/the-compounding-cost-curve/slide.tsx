import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import { FixesSliderClient } from './fixes-slider.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MODEL_PRICINGS } from './model-pricing.pure';

function PricingBars(): ReactElement {
  return (
    <div className="space-y-3">
      {MODEL_PRICINGS.map((m) => (
        <div key={m.name} className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{m.name}</span>
            <span className="font-mono text-lg font-bold">${m.costPerFix.toFixed(2)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
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
  messages: { en, de },
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
