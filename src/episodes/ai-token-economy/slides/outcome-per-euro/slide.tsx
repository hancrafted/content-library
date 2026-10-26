import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OutcomePerEuroClient } from './outcome-per-euro.client';

function SubsidyCallout(): ReactElement {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
      <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 font-mono text-sm font-semibold text-primary">
        2–10×
      </span>
      <p className="text-sm text-muted-foreground">
        Today&rsquo;s prices are subsidized — vendors sell intelligence below cost to build adoption. When subsidies
        expire, outcome per euro decides who survives.
      </p>
    </div>
  );
}

export const outcomePerEuro = slide({
  slug: 'outcome-per-euro',
  messages: { en, de },
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
