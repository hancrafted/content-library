import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

function DoorCards(): ReactElement {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-muted/60 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
          door 1 · the individual
        </p>
        <h4 className="mt-1 font-display text-xl font-bold">Human with AI</h4>
        <p className="mt-2 text-sm text-muted-foreground">5–20× individual throughput by directing synthetic labor.</p>
      </div>
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary/70">door 2 · the organization</p>
        <h4 className="mt-1 font-display text-xl font-bold">Leader of humans with AI</h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Upskilling whole teams into fluent directors of automated systems.
        </p>
      </div>
    </div>
  );
}

export const leadOneUpskillMany = slide({
  slug: 'lead-one-upskill-many',
  messages: { en, de },
  notes: [{ slug: 'upskill-vs-replace', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-6 border-l-2 border-primary/50 pl-5 font-display text-lg font-semibold text-foreground">
        You can opt out of managing it. The people who don&rsquo;t will simply out-produce you.
      </div>
      <DoorCards />
    </SlideFrame>
  ),
});
