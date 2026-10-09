import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function DoorCards(): ReactElement {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="card border border-base-300 bg-base-200/60 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-base-content/40">
          door 1 · the individual
        </p>
        <h4 className="mt-1 font-display text-xl font-bold">Human with AI</h4>
        <p className="mt-2 text-sm text-base-content/70">5–20× individual throughput by directing synthetic labor.</p>
      </div>
      <div className="card border border-primary/40 bg-primary/5 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary/70">door 2 · the organization</p>
        <h4 className="mt-1 font-display text-xl font-bold">Leader of humans with AI</h4>
        <p className="mt-2 text-sm text-base-content/70">
          Upskilling whole teams into fluent directors of automated systems.
        </p>
      </div>
    </div>
  );
}

export const leadOneUpskillMany = slide({
  slug: 'lead-one-upskill-many',
  notes: [{ slug: 'upskill-vs-replace', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-6 border-l-2 border-primary/50 pl-5 font-display text-lg font-semibold text-base-content">
        You can opt out of managing it. The people who don&rsquo;t will simply out-produce you.
      </div>
      <DoorCards />
    </SlideFrame>
  ),
});
